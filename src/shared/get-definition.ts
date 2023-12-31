import { BackendMethod, SqlDatabase } from "remult"

export class GetDefinition {
  @BackendMethod({ allowed: true })
  static async getTableInfo(schema: string, name: string) {
    let c = await SqlDatabase.getDb().createCommand()
    let r = await c.execute(
      `select * from information_schema.columns where table_schema=${c.addParameterAndReturnSqlToken(
        schema
      )} and table_name=${c.addParameterAndReturnSqlToken(name)}`
    )
    return r.rows.map((x) => {
      return {
        name: x.column_name,
        type: x.data_type,
        nullable: x.is_nullable == "YES",
        maxLength: x.character_maximum_length,
        datetime_precision: x.datetime_precision,
        column_default: x.column_default,
      }
    })
  }
  @BackendMethod({ allowed: true })
  static async getTables(): Promise<TableInfo[]> {
    return SqlDatabase.getDb()
      .execute(
        "select * from information_schema.tables where table_schema not in ('pg_catalog','information_schema')"
      )
      .then((r) =>
        r.rows.map((x) => {
          //    return x
          return { schema: x.table_schema, name: x.table_name }
        })
      )
  }
}

export interface TableInfo {
  schema: string
  name: string
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  maxLength: number
  datetime_precision: number
  column_default: string
}
