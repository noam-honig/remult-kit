import type { SqlDatabase } from 'remult'

import type { DbTable } from './DbTable.js'
import type { DbTableColumnInfo, IDatabase } from './types.js'

export class DbPostgres implements IDatabase {
  name = 'postgres'
  constructor(private sqlDatabase: SqlDatabase) {}
  async test() {
    await this.sqlDatabase!.execute('select 1')
  }
  schema = 'public'

  async getTablesInfo() {
    const command = this.sqlDatabase!.createCommand()
    const tablesInfo = await command.execute(
      `SELECT table_name, table_schema FROM information_schema.tables;`,
    )
    return tablesInfo.rows
  }

  getRemultEntityDbName(table: DbTable) {
    if (table.dbName !== table.className) {
      if (table.schema === 'public' && table.dbName === 'user') {
        // user is a reserved keyword, we need to speak about public.user
        return `'public.${table.dbName}'`
      } else if (table.schema === 'public') {
        if (table.dbName !== table.key) {
          return table.dbName
        }
      } else {
        return `${table.schema}.${table.dbName}`
      }
    }
    return null
  }

  async getTableColumnInfo(schema: string, tableName: string) {
    const command = this.sqlDatabase!.createCommand()
    const tablesColumnInfo = await command.execute(
      `SELECT 
          cols.column_name, 
          cols.column_default, 
          cols.data_type, 
          cols.datetime_precision AS precision, 
          cols.character_maximum_length, 
          cols.udt_name, 
          cols.is_nullable,
          CASE 
            WHEN kc.column_name IS NOT NULL THEN 'YES' 
            ELSE 'NO' 
            END AS is_key,
          cols.*
        FROM 
          INFORMATION_SCHEMA.COLUMNS cols
        LEFT JOIN 
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE kc 
          ON kc.table_name = cols.table_name 
          AND kc.column_name = cols.column_name 
          AND kc.constraint_name IN (
            SELECT constraint_name 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE constraint_type = 'PRIMARY KEY'
          )
        WHERE
          cols.table_name = ${command.param(tableName)}
          AND cols.table_schema = ${command.param(schema)}
        ORDER BY 
          cols.ordinal_position`,
    )

    return tablesColumnInfo.rows.map((c) => {
      const i: DbTableColumnInfo = {
        column_name: c.column_name,
        column_default: c.column_default,
        data_type: c.data_type,
        precision: c.precision,
        character_maximum_length: c.character_maximum_length,
        udt_name: c.udt_name,
        is_nullable: c.is_nullable,
        is_key: c.is_key === 'YES',
      }

      return i
    })
  }

  async getUniqueInfo(schema: string) {
    const command = this.sqlDatabase!.createCommand()
    const tablesColumnInfo = await command.execute(
      `SELECT table_schema, table_name, column_name
			FROM information_schema.table_constraints AS c
				 JOIN information_schema.constraint_column_usage AS cc
						USING (table_schema, table_name, constraint_name)
			WHERE c.constraint_type = 'UNIQUE' ` +
        `AND table_schema = ${command.addParameterAndReturnSqlToken(schema)};`,
    )

    return tablesColumnInfo.rows.map((c) => {
      return {
        table_schema: c.table_schema,
        table_name: c.table_name,
        column_name: c.column_name,
      }
    })
  }

  async getForeignKeys() {
    const command = this.sqlDatabase!.createCommand()
    const foreignKeys = await command.execute(
      `SELECT
				tc.table_schema,
				tc.table_name,
				kcu.column_name,
				ccu.table_schema AS foreign_table_schema,
				ccu.table_name AS foreign_table_name,
				ccu.column_name AS foreign_column_name
			FROM
				information_schema.table_constraints AS tc
				JOIN information_schema.key_column_usage AS kcu
				ON tc.constraint_name = kcu.constraint_name
				AND tc.table_schema = kcu.table_schema
				JOIN information_schema.constraint_column_usage AS ccu
				ON ccu.constraint_name = tc.constraint_name
				AND ccu.table_schema = tc.table_schema
			WHERE tc.constraint_type = 'FOREIGN KEY';`,
    )

    return foreignKeys.rows
  }

  async getEnumDef(udt_name: string) {
    const command = this.sqlDatabase!.createCommand()
    const enumDef = await command.execute(
      `SELECT t.typname, e.enumlabel
							FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
							WHERE t.typname = '${udt_name}'
							ORDER BY t.typname, e.enumlabel;`,
    )

    return enumDef.rows
  }
}
