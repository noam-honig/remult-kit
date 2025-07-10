import type { KnexDataProvider } from 'remult/remult-knex'

import type { DbTable } from './DbTable.js'
import type { DbTableColumnInfo, IDatabase } from './types.js'

export class DbSQLite implements IDatabase {
  name = 'sqlite'
  constructor(private knex: KnexDataProvider) { }
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
            // table_schema: 'main',
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
          // SQLite uses 0 and 1 in notnull and pk but they are read as strings
          is_nullable: parseInt(c.notnull) === 0 ? 'YES' : 'NO',
          is_key: parseInt(c.pk) === 1
        }
        return i
      },
    )
  }

  async getUniqueInfo(schema: string) {
    const tablesColumnInfo = await this.knex!.knex.raw(`SELECT 
    'main' as table_schema,
    m.tbl_name as table_name,
    ii.name as column_name
FROM sqlite_master AS m,
    pragma_index_list(m.name) AS il,
    pragma_index_info(il.name) AS ii
WHERE 
    m.type = 'table'
	and il.[unique] = 1
GROUP BY
    m.tbl_name,
    il.name,
    ii.name`);
    return tablesColumnInfo;
  }

  async getForeignKeys() {
    const foreignKeys = await this.knex!.knex.raw(
    `SELECT 
      'main' AS table_schema,
       m.name AS table_name,
	     p."from" AS column_name,
	     'main' AS foreign_table_schema,
	     p."table" AS foreign_table_name,
	     p."to" AS foreign_column_name
     FROM
      sqlite_master m
      JOIN pragma_foreign_key_list(m.name) p ON m.name != p."table"
     WHERE m.type = 'table'
     ORDER BY m.name;`, );
     return foreignKeys;
  }

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
