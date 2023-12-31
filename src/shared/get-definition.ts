import { BackendMethod, SqlDatabase, remult } from "remult"
import { KnexDataProvider } from "remult/remult-knex"

export class GetDefinition {
  @BackendMethod({ allowed: true })
  static async getTableInfo(schema: string, name: string) {
    return getStrategy().getTableInfo(schema, name)
  }
  @BackendMethod({ allowed: true })
  static async getTables(): Promise<TableInfo[]> {
    return getStrategy().getTables()
  }
}
function getStrategy() {
  if (remult.dataProvider instanceof SqlDatabase) return new PostgresSql()
  else return new KnexPostgres()
}
class PostgresSql {
  async getTableInfo(schema: string, name: string) {
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
  async getTables(): Promise<TableInfo[]> {
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
class KnexPostgres implements PostgresSql {
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
    const db = KnexDataProvider.getDb()
    return db
      .select("*")
      .from("information_schema.columns")
      .where("table_schema", schema)
      .where("table_name", name)
      .then((r) =>
        r.map((x) => {
          return {
            name: x.column_name,
            type: x.data_type,
            nullable: x.is_nullable == "YES",
            maxLength: x.character_maximum_length,
            datetime_precision: x.datetime_precision,
            column_default: x.column_default,
          }
        })
      )
  }
  getTables(): Promise<TableInfo[]> {
    const db = KnexDataProvider.getDb()
    return db
      .select("*")
      .from("information_schema.tables")
      .whereNotIn("table_schema", ["pg_catalog", "information_schema"])
      .then((r) =>
        r.map((x) => {
          return {
            schema: x.table_schema,
            name: x.table_name,
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
