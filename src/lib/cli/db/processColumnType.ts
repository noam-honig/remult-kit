import { Log } from '@kitql/helpers'

import { kababToConstantCase, toPascalCase } from '../utils/case.js'
import type { DbTable } from './DbTable'
import type { DataTypeProcessorFunction, DbTableColumnInfo, FieldInfo, IDatabase } from './types'

const stringProcessor: DataTypeProcessorFunction = ({ column_name, column_default }) => {
  let defaultVal = column_default !== null ? column_default : undefined
  if (defaultVal) {
    const index = defaultVal?.indexOf("'::")
    if (index > 0) defaultVal = defaultVal?.substring(0, index + 1)
    if (defaultVal == `(' ')`) defaultVal = '""'
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

const enumProcessor: DataTypeProcessorFunction = ({ column_default, udt_name }) => {
  const enumDefault = column_default?.split("'")[1]

  return {
    decorator: `@Field`,
    decoratorArgsValueType: `() => ${toPascalCase(udt_name)}`,
    decoratorArgsOptions: ["inputType: 'selectEnum'"],
    type: column_default === null ? toPascalCase(udt_name) : null,
    defaultVal:
      column_default !== null && enumDefault
        ? `${toPascalCase(udt_name)}.${kababToConstantCase(enumDefault)}`
        : undefined,
  }
}

const arrayProcessor: DataTypeProcessorFunction = (input) => {
  // udtName will show "_numeric" or "_permission_enum" (USER-DEFINED)
  const cleanUdtName = input.udt_name.substring(1)

  let toRet = {}

  // Check regular types
  if (dataTypeProcessors[cleanUdtName]) {
    const field = dataTypeProcessors[cleanUdtName]?.(input)
    toRet = { ...field }
  } else {
    // It means that it's a custom type
    const field = dataTypeProcessors['USER-DEFINED']?.({
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

  CHAR: charProcessor,
  char: charProcessor,

  date: dateProcessor,
  DATE: dateProcessor,
  datetime: dateProcessor,
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

export const processColumnType = (
  input: DbTableColumnInfo & {
    enums: Record<string, string[]>
    db: IDatabase
    table: DbTable
  },
) => {
  const { data_type } = input
  const field = dataTypeProcessors[data_type]?.(input)

  if (!field) {
    new Log('remult-kit').error(`Unmanaged data type: ${data_type}`, input)
    // throw new Error(`Unmanaged data type: ${data_type}`, { cause: input })
  }

  return {
    decorator: field?.decorator ?? '@Fields.string',
    decoratorArgsValueType: field?.decoratorArgsValueType ?? '',
    decoratorArgsOptions: field?.decoratorArgsOptions ?? [],
    type: field?.type === undefined ? 'string' : field?.type,
    defaultVal: field?.defaultVal ?? null,
    enumAdditionalName: field?.enumAdditionalName ?? null,
  }
}
