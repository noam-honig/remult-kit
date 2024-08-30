import type { DbTable } from './DbTable'

export interface IDatabase {
  schema?: string
  test(): Promise<void>
  getTablesInfo(): Promise<DbTableInfo[]>
  getTableColumnInfo(schema: string | undefined, tableName: string): Promise<DbTableColumnInfo[]>
  getUniqueInfo(schema?: string): Promise<
    {
      table_schema: string
      table_name: string
      column_name: string
    }[]
  >
  getForeignKeys(): Promise<DbForeignKey[]>
  getEnumDef(udt_name: string): Promise<EnumDef[]>

  getRemultEntityDbName(table: DbTable): string | null
}

export interface DbTableInfo {
  table_name: string
  table_schema?: string
}

export interface DbTableColumnInfo {
  column_name: string
  column_default: string | null
  data_type: string
  datetime_precision: number
  character_maximum_length: number
  udt_name: string
  is_nullable: 'YES' | 'NO'
  is_key: boolean
}

export interface DbForeignKey {
  table_schema: string
  table_name: string
  column_name: string
  foreign_table_schema: string
  foreign_table_name: string
  foreign_column_name: string
}

export interface EnumDef {
  typname: string
  enumlabel: string
}

export interface FieldInfo {
  type: string | null
  decorator: string
  defaultVal: string
  decoratorArgsValueType: string
  decoratorArgsOptions: string[]
  enumAdditionalName: string
}

export type DataTypeProcessorFunction = (
  input: DbTableColumnInfo & {
    table: DbTable
  },
) => Partial<FieldInfo>
