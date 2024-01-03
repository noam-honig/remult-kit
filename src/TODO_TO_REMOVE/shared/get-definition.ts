import { DataProvider, SqlDatabase, remult } from "remult"
import type { KnexDataProvider } from "remult/remult-knex"

export function getStrategy(dataProvider?: DataProvider) {
  if (!dataProvider) dataProvider = remult.dataProvider
  if ((dataProvider as SqlDatabase).createCommand)
    return new TheServer(dataProvider)
  else return new ServerWithKnex(dataProvider)
}
export class TheServer {
  constructor(public db: DataProvider) {}
  async getTableInfo(schema: string, name: string) {
    let c = await (this.db as SqlDatabase).createCommand()
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
  async getTables(): Promise<TableInfo[]> {
    return (this.db as SqlDatabase)
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
class ServerWithKnex extends TheServer {
  getTableInfo(
    schema: string,
    name: string
  ): Promise<
    {
      name: any
      type: any
      nullable: boolean
      maxLength: any
      datetime_precision: any
      column_default: any
    }[]
  > {
    const db = (this.db as KnexDataProvider).knex
    return db
      .select("*")
      .from("information_schema.columns")
      .where("table_schema", schema)
      .where("table_name", name)
      .then((r) =>
        r.map((x) => {
          console.log(x)
          return {
            name: x.column_name || x.COLUMN_NAME,
            type: x.data_type || x.DATA_TYPE,
            nullable: (x.is_nullable || x.IS_NULLABLE) == "YES",
            maxLength: x.character_maximum_length || x.CHARACTER_MAXIMUM_LENGTH,
            datetime_precision: x.datetime_precision || x.DATETIME_PRECISION,
            column_default: x.column_default || x.COLUMN_DEFAULT,
          }
        })
      )
  }
  getTables(): Promise<TableInfo[]> {
    const db = (this.db as KnexDataProvider).knex
    return db
      .select("*")
      .from("information_schema.tables")
      .whereNotIn("table_schema", [
        "pg_catalog",
        "information_schema",
        "mysql",
        "sys",
        "performance_schema",
      ])
      .then((r) =>
        r.map((x) => {
          return {
            schema: x.table_schema || x.TABLE_SCHEMA,
            name: x.table_name || x.TABLE_NAME,
          }
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
  maxLength: number | null
  datetime_precision: number | null
  column_default: string
}
