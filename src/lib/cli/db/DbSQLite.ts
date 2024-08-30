import type { KnexDataProvider } from 'remult/remult-knex'

import type { DbTable } from './DbTable.js'
import type { DbTableColumnInfo, IDatabase } from './types.js'

export class DbSQLite implements IDatabase {
  constructor(private knex: KnexDataProvider) {}
  async test() {
    await this.knex.knex.raw('select 1')
  }

  async getTablesInfo() {
    return this.knex.knex
      .select('name')
      .from('sqlite_master')
      .where({ type: 'table' })
      .whereNotIn('name', [
        'sqlite_sequence',
        'sqlite_stat1',
        'sqlite_stat2',
        'sqlite_stat3',
        'sqlite_stat4',
      ])
      .then((r) =>
        r.map((x) => {
          return {
            table_name: x.name,
          }
        }),
      )
  }

  getRemultEntityDbName(table: DbTable) {
    return table.dbName
  }

  async getTableColumnInfo(schemaName: string, tableName: string) {
    const tablesColumnInfo = await this.knex!.knex.raw(`PRAGMA table_info('${tableName}')`)
    return tablesColumnInfo.map(
      (c: {
        cid: number
        name: string
        type: string
        notnull: number
        dflt_value: string
        pk: number
      }) => {
        if (c.dflt_value?.startsWith('(') && c.dflt_value?.endsWith(')')) {
          c.dflt_value = c.dflt_value.slice(1, -1)
        }

        let character_maximum_length = 0
        // To manage "varchar](40"
        const s = c.type.split('](')
        if (s.length > 1) {
          c.type = s[0]
          character_maximum_length = parseInt(s[1])
        }

        // To manage "varchar(100)"
        const typeRegex = /^(\w+)\((\d+)\)$/
        const typeMatch = c.type.match(typeRegex)
        const data_type = typeMatch ? typeMatch[1] : c.type
        character_maximum_length = typeMatch ? parseInt(typeMatch[2]) : 0

        const i: DbTableColumnInfo = {
          column_name: c.name,
          column_default: c.dflt_value,
          data_type,
          precision: 0, // I don't know
          character_maximum_length,
          udt_name: '',
          is_nullable: c.notnull === 0 ? 'YES' : 'NO',
          is_key: c.pk === 1,
        }
        return i
      },
    )
  }

  // eslint-disable-next-line
  async getUniqueInfo(schema: string) {
    // TODO
    return []
    // const command = this.sqlDatabase!.createCommand();
    // const tablesColumnInfo = await command.execute(
    // 	`SELECT table_schema, table_name, column_name
    // 	FROM information_schema.table_constraints AS c
    // 		 JOIN information_schema.constraint_column_usage AS cc
    // 				USING (table_schema, table_name, constraint_name)
    // 	WHERE c.constraint_type = 'UNIQUE' ` +
    // 		`AND table_schema = ${command.addParameterAndReturnSqlToken(schema)};`,
    // );

    // return tablesColumnInfo.rows.map((c) => {
    // 	return {
    // 		table_schema: c.table_schema,
    // 		table_name: c.table_name,
    // 		column_name: c.column_name,
    // 	};
    // });
  }

  async getForeignKeys() {
    // TODO
    return []
    // const command = this.sqlDatabase!.createCommand();
    // const foreignKeys = await command.execute(
    // 	`SELECT
    // 		tc.table_schema,
    // 		tc.table_name,
    // 		kcu.column_name,
    // 		ccu.table_schema AS foreign_table_schema,
    // 		ccu.table_name AS foreign_table_name,
    // 		ccu.column_name AS foreign_column_name
    // 	FROM
    // 		information_schema.table_constraints AS tc
    // 		JOIN information_schema.key_column_usage AS kcu
    // 		ON tc.constraint_name = kcu.constraint_name
    // 		AND tc.table_schema = kcu.table_schema
    // 		JOIN information_schema.constraint_column_usage AS ccu
    // 		ON ccu.constraint_name = tc.constraint_name
    // 		AND ccu.table_schema = tc.table_schema
    // 	WHERE tc.constraint_type = 'FOREIGN KEY';`,
    // );

    // return foreignKeys.rows;
  }

  // eslint-disable-next-line
  async getEnumDef(udt_name: string) {
    // TODO
    return []
    // const command = this.sqlDatabase!.createCommand();
    // const enumDef = await command.execute(
    // 	`SELECT t.typname, e.enumlabel
    // 					FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    // 					WHERE t.typname = '${udt_name}'
    // 					ORDER BY t.typname, e.enumlabel;`,
    // );

    // return enumDef.rows;
  }
}
