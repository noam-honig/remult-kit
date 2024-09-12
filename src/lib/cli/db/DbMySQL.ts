import type { KnexDataProvider } from 'remult/remult-knex'

import type { DbTable } from './DbTable.js'
import type { DbTableColumnInfo, IDatabase } from './types.js'

export class DbMySQL implements IDatabase {
  name = 'mysql'
  constructor(
    private knex: KnexDataProvider,
    public schema: string,
  ) {}
  async test() {
    await this.knex.knex.raw('select 1')
  }

  async getTablesInfo() {
    return this.knex.knex
      .select('TABLE_SCHEMA', 'TABLE_NAME')
      .from('information_schema.tables')
      .whereNotIn('table_schema', [
        'pg_catalog',
        'information_schema',
        'mysql',
        'sys',
        'performance_schema',
      ])
      .then((r) =>
        r.map((x) => {
          return {
            table_schema: x.table_schema || x.TABLE_SCHEMA,
            table_name: x.table_name || x.TABLE_NAME,
          }
        }),
      )
  }

  getRemultEntityDbName(table: DbTable) {
    return table.dbName
  }

  async getTableColumnInfo(schema: string, tableName: string) {
    const tablesColumnInfo = await this.knex!.knex('INFORMATION_SCHEMA.COLUMNS')
      .select()
      .where('TABLE_NAME', tableName)
      .orderBy('ORDINAL_POSITION')

    return tablesColumnInfo.map((c) => {
      const i: DbTableColumnInfo = {
        column_name: c.COLUMN_NAME,
        column_default:
          c.COLUMN_DEFAULT === null
            ? null
            : c.DATA_TYPE === 'varchar'
              ? `'${c.COLUMN_DEFAULT}'`
              : c.COLUMN_DEFAULT,
        data_type: c.DATA_TYPE,
        precision: c.NUMERIC_PRECISION,
        character_maximum_length: c.CHARACTER_MAXIMUM_LENGTH,
        udt_name: '',
        is_nullable: c.IS_NULLABLE === 'NO' ? 'NO' : 'YES',
        is_key: c.COLUMN_KEY === 'PRI',
      }
      return i
    })
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
