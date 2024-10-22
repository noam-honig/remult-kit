import { cyan, green, Log, yellow } from '@kitql/helpers'

import type { DbTable } from './DbTable'
import type { DataTypeProcessorFunction, DbTableColumnInfo, FieldInfo, IDatabase } from './types'

const stringProcessor: DataTypeProcessorFunction = ({ column_name, column_default, data_type }) => {
  let defaultVal = column_default !== null ? column_default : undefined
  if (defaultVal) {
    const index = defaultVal?.indexOf("'::")
    if (index > 0) defaultVal = defaultVal?.substring(0, index + 1)
    if (defaultVal == `(' ')`) defaultVal = `''`
  }

  if (defaultVal?.endsWith('()')) {
    defaultVal = `''`
    // defaultVal = `'' // ${defaultVal}`
  }

  if (data_type === 'uuid') {
    return {
      type: 'string',
      decorator: '@Fields.uuid',
      defaultVal,
    }
  }
  if (data_type === 'cuid') {
    return {
      type: 'string',
      decorator: '@Fields.cuid',
      defaultVal,
    }
  }
  if (column_name === 'id') {
    return {
      type: 'string',
      decorator: '@Fields.cuid',
      defaultVal,
    }
  }

  return {
    decorator: '@Fields.string',
    type: 'string',
    defaultVal,
  }
}

const booleanProcessor: DataTypeProcessorFunction = ({ column_default }) => {
  if (column_default !== null) {
    return {
      decorator: '@Fields.boolean',
      type: 'boolean',
      defaultVal: column_default === 'true' ? 'true' : 'false',
    }
  }
  return {
    decorator: '@Fields.boolean',
    type: 'boolean',
  }
}

const dateProcessor: DataTypeProcessorFunction = ({ column_name, column_default, udt_name }) => {
  const toRet = {
    decorator: '@Fields.date',
    type: 'Date',
    defaultVal: column_default !== null ? 'new Date()' : '',
  }

  if (
    column_name === 'createdAt' ||
    column_name === 'dateCreated' ||
    column_name === 'created_at' ||
    column_name === 'createdat'
  ) {
    toRet.decorator = '@Fields.createdAt'
  }

  if (column_name === 'updatedAt' || column_name === 'updated_at' || column_name === 'updatedat') {
    toRet.decorator = '@Fields.updatedAt'
  }

  if (udt_name === 'date') {
    toRet.decorator = '@Fields.dateOnly'
  }

  return toRet
}

const enumProcessor: DataTypeProcessorFunction = async (input) => {
  const enumDefault = input.column_default?.split("'")[1]

  if ('USER-DEFINED' === input.data_type) {
    const enumDef = await input.db.getEnumDef(input.udt_name)
    const values = enumDef.map((e) => e.enumlabel)

    return {
      decorator: `@Fields.literal`,
      decoratorArgsValueType: `() => [${values.map((v) => `'${v}'`).join(', ')}] as const`,
      decoratorArgsOptions: [],
      type: values.map((v) => `'${v}'`).join(' | '),
      forceTypeToBePresent: true,
      defaultVal: input.column_default !== null && enumDefault ? `'${enumDefault}'` : undefined,
    }
  }
  return await stringProcessor(input)
}

const arrayProcessor: DataTypeProcessorFunction = async (input) => {
  // udtName will show "_numeric" or "_permission_enum" (USER-DEFINED)
  const cleanUdtName = input.udt_name.substring(1)

  let toRet = {}

  // Check regular types
  if (dataTypeProcessors[cleanUdtName]) {
    const field = await dataTypeProcessors[cleanUdtName]?.(input)
    toRet = { ...field }
  } else {
    // It means that it's a custom type
    const field = await dataTypeProcessors['USER-DEFINED']?.({
      ...input,
      data_type: cleanUdtName,
    })
    if (field) {
      // field.decoratorArgsValueType = field.decoratorArgsValueType + "[]";
      field.decoratorArgsValueType = '() => []'
      field.enumAdditionalName = cleanUdtName
      toRet = { ...field }
    }
  }

  return {
    ...toRet,
    decorator: '@Fields.json',

    type: 'type' in toRet && typeof toRet.type === 'string' ? toRet.type + '[]' : undefined,
  }
}

const jsonProcessor: DataTypeProcessorFunction = () => {
  return {
    decorator: '@Fields.json',
    defaultVal: '{}',
  }
}

const intOrAutoIncrementProcessor: DataTypeProcessorFunction = ({ column_default }) => {
  return {
    type: 'number',
    decorator: column_default?.startsWith('nextval') ? '@Fields.autoIncrement' : '@Fields.integer',
    defaultVal: column_default?.startsWith('nextval')
      ? '0'
      : column_default != null
        ? column_default
        : undefined,
  }
}

const intOrNumberProcessor: DataTypeProcessorFunction = ({ precision: datetime_precision }) => {
  return {
    type: 'number',
    decorator: datetime_precision === 0 ? '@Fields.integer' : '@Fields.number',
  }
}

const numberProcessor: DataTypeProcessorFunction = ({ column_default }) => {
  const toRet: Partial<FieldInfo> = {
    type: 'number',
    decorator: '@Fields.number',
  }
  if (column_default !== null) {
    toRet.defaultVal = column_default
  }
  return toRet
}

const charProcessor: DataTypeProcessorFunction = (input) => {
  if (input.character_maximum_length == 8 && input.column_default == "('00000000')") {
    return { decorator: '@Fields.dateOnly', type: 'Date' }
  }
  // fallback
  return stringProcessor(input)
}

const dataTypeProcessors: Record<string, DataTypeProcessorFunction> = {
  real: intOrAutoIncrementProcessor,
  int: intOrAutoIncrementProcessor,
  INT: intOrAutoIncrementProcessor,
  integer: intOrAutoIncrementProcessor,
  smallint: intOrAutoIncrementProcessor,
  tinyint: intOrAutoIncrementProcessor,

  'INTEGER UNSIGNED': intOrNumberProcessor,
  bigint: intOrNumberProcessor,
  float: intOrNumberProcessor,
  numeric: intOrNumberProcessor,
  NUMBER: intOrNumberProcessor,
  'double precision': intOrNumberProcessor,

  money: numberProcessor,
  decimal: numberProcessor,

  nchar: stringProcessor,
  nvarchar: stringProcessor,
  ntext: stringProcessor,
  NVARCHAR2: stringProcessor,
  text: stringProcessor,
  varchar: stringProcessor,
  VARCHAR2: stringProcessor,
  character: stringProcessor,
  'character varying': stringProcessor,
  inet: stringProcessor,
  TEXT: stringProcessor,

  uuid: stringProcessor,
  cuid: stringProcessor,

  CHAR: charProcessor,
  char: charProcessor,

  date: dateProcessor,
  DATE: dateProcessor,
  datetime: dateProcessor,
  time: dateProcessor, // reconsider (comes from sql server)
  image: stringProcessor, // reconsider (comes from sql server)
  DATETIME: dateProcessor,
  datetime2: dateProcessor,
  'timestamp without time zone': dateProcessor,
  'timestamp with time zone': dateProcessor,

  bit: booleanProcessor,
  boolean: booleanProcessor,

  json: jsonProcessor,
  jsonb: jsonProcessor,

  ARRAY: arrayProcessor,
  'USER-DEFINED': enumProcessor,
}

export const processColumnType = async (
  dbCol: DbTableColumnInfo & {
    enums: Record<string, string[]>
    db: IDatabase
    table: DbTable
  },
): Promise<FieldInfo> => {
  const { data_type, enums, db, table, ...rest } = dbCol
  const field = await dataTypeProcessors[data_type]?.(dbCol)

  let comment: string | null = null
  if (!field) {
    comment = `Unhandled data type: "${data_type}" for db "${dbCol.db.name}"`

    new Log('remult-kit')
      .info(`Unhandled data type: "${yellow(data_type)}" for db "${green(dbCol.db.name)}"
🙏 Report it ${cyan(`https://github.com/noam-honig/remult-kit/issues/new?title=${encodeURI(comment)}`)}
`)
    //             ${gray(`If it's not to private, please provide the following information :`)}
    // ${stry(rest)}
  }

  const toRet = {
    decorator: field?.decorator ?? '@Fields.string',
    decoratorArgsValueType: field?.decoratorArgsValueType ?? '',
    decoratorArgsOptions: field?.decoratorArgsOptions ?? [],
    type: field?.type === undefined ? 'string' : field?.type,
    forceTypeToBePresent: field?.forceTypeToBePresent ?? false,
    defaultVal: field?.defaultVal ?? null,
    enumAdditionalName: field?.enumAdditionalName ?? null,

    comment,

    db: dbCol,
  }
  return toRet
}
