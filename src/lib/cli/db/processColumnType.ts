import { kababToConstantCase, toPascalCase } from '../utils/case.js'
import type { DbTable } from './DbTable'
import type { ColumnInfo, DataTypeProcessorFunction, IDatabase } from './types'

const stringProcessor: DataTypeProcessorFunction = ({ columnName, columnDefault }) => {
  let defaultVal = columnDefault !== null ? columnDefault : undefined
  if (defaultVal) {
    const index = defaultVal?.indexOf("'::")
    if (index > 0) defaultVal = defaultVal?.substring(0, index + 1)
    if (defaultVal==`(' ')`)
    defaultVal="\"\""
      
  }
  if (columnName === 'id') {
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

const booleanProcessor: DataTypeProcessorFunction = () => {
  return {
    decorator: '@Fields.boolean',
    type: 'boolean',
  }
}

const dateProcessor: DataTypeProcessorFunction = ({ columnName, columnDefault, udtName }) => {
  const toRet = {
    decorator: '@Fields.date',
    type: 'Date',
    defaultVal: columnDefault !== null ? 'new Date()' : '',
  }

  if (
    columnName === 'createdAt' ||
    columnName === 'dateCreated' ||
    columnName === 'created_at' ||
    columnName === 'createdat'
  ) {
    toRet.decorator = '@Fields.createdAt'
  }

  if (columnName === 'updatedAt' || columnName === 'updated_at' || columnName === 'updatedat') {
    toRet.decorator = '@Fields.updatedAt'
  }

  if (udtName === 'date') {
    toRet.decorator = '@Fields.dateOnly'
  }

  return toRet
}

const enumProcessor: DataTypeProcessorFunction = ({ columnDefault, udtName }) => {
  const enumDefault = columnDefault?.split("'")[1]

  return {
    decorator: `@Field`,
    decoratorArgsValueType: `() => ${toPascalCase(udtName)}`,
    decoratorArgsOptions: ["inputType: 'selectEnum'"],
    type: columnDefault === null ? toPascalCase(udtName) : null,
    defaultVal:
      columnDefault !== null && enumDefault
        ? `${toPascalCase(udtName)}.${kababToConstantCase(enumDefault)}`
        : undefined,
  }
}

const arrayProcessor: DataTypeProcessorFunction = input => {
  // udtName will show "_numeric" or "_permission_enum" (USER-DEFINED)
  const cleanUdtName = input.udtName.substring(1)

  let toRet = {}

  // Check regular types
  if (dataTypeProcessors[cleanUdtName]) {
    const field = dataTypeProcessors[cleanUdtName]?.(input)
    toRet = { ...field }
  } else {
    // It means that it's a custom type
    const field = dataTypeProcessors['USER-DEFINED']?.({
      ...input,
      dataType: cleanUdtName,
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

const intOrAutoIncrementProcessor: DataTypeProcessorFunction = ({ columnDefault }) => {
  return {
    type: 'number',
    decorator: columnDefault?.startsWith('nextval') ? '@Fields.autoIncrement' : '@Fields.integer',
    defaultVal: columnDefault?.startsWith('nextval')
      ? '0'
      : columnDefault != null
        ? columnDefault
        : undefined,
  }
}

const intOrNumberProcessor: DataTypeProcessorFunction = ({ datetimePrecision }) => {
  return {
    type: 'number',
    decorator: datetimePrecision === 0 ? '@Fields.integer' : '@Fields.number',
  }
}

const charProcessor: DataTypeProcessorFunction = input => {
  if (input.characterMaximumLength == 8 && input.columnDefault == "('00000000')") {
    return { decorator: '@Fields.dateOnly', type: 'Date' }
  }
  // fallback
  return stringProcessor(input)
}

const dataTypeProcessors: Record<string, DataTypeProcessorFunction> = {
  decimal: intOrAutoIncrementProcessor,
  real: intOrAutoIncrementProcessor,
  int: intOrAutoIncrementProcessor,
  integer: intOrAutoIncrementProcessor,
  smallint: intOrAutoIncrementProcessor,
  tinyint: intOrAutoIncrementProcessor,

  bigint: intOrNumberProcessor,
  float: intOrNumberProcessor,
  numeric: intOrNumberProcessor,
  NUMBER: intOrNumberProcessor,
  money: intOrNumberProcessor,
  'double precision': intOrNumberProcessor,

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

  uuid: stringProcessor,

  CHAR: charProcessor,
  char: charProcessor,

  date: dateProcessor,
  DATE: dateProcessor,
  datetime: dateProcessor,
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
  input: ColumnInfo & {
    enums: Record<string, string[]>
    db: IDatabase
    table: DbTable
  },
) => {
  const { characterMaximumLength, columnDefault, columnName, dataType, udtName, table } = input

  const field = dataTypeProcessors[dataType]?.(input)

  if (!field) {
    // console.log('')
    console.error('unmanaged', {
      tableObj: JSON.stringify(table),
      columnName,
      data_type: dataType,
      character_maximum_length: characterMaximumLength,
      column_default: columnDefault,
      udt_name: udtName,
    })
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
