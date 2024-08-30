import type { KnexDataProvider } from 'remult/remult-knex'

import type { DbTable } from './DbTable.js'
import type { DbTableColumnInfo, IDatabase } from './types.js'

export class DbMsSQL implements IDatabase {
  constructor(
    private knex: KnexDataProvider,
    public schema: string = 'dbo',
  ) {}

  async test() {
    await this.knex.knex.raw('SELECT 1')
  }

  async getTablesInfo() {
    return this.knex.knex
      .select('TABLE_SCHEMA', 'TABLE_NAME')
      .from('INFORMATION_SCHEMA.TABLES')
      .whereNotIn('TABLE_SCHEMA', [
        'pg_catalog',
        'information_schema',
        'mysql',
        'sys',
        'performance_schema',
      ])
      .then((r) =>
        r.map((x) => ({
          table_schema: x.TABLE_SCHEMA,
          table_name: x.TABLE_NAME,
        })),
      )
  }

  getRemultEntityDbName(table: DbTable) {
    if (table.dbName !== table.className) {
      if (table.schema === 'dbo') {
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
    const tablesColumnInfo = await this.knex
      .knex('INFORMATION_SCHEMA.COLUMNS')
      .select()
      .where('TABLE_NAME', tableName)
      .andWhere('TABLE_SCHEMA', schema)
      .orderBy('ORDINAL_POSITION')

    const primaryKeys = await this.getPrimaryKeys(schema, tableName)

    return tablesColumnInfo.map((c) => {
      console.log(`c`, c)

      const i: DbTableColumnInfo = {
        column_name: c.COLUMN_NAME,
        column_default: c.COLUMN_DEFAULT,
        data_type: c.DATA_TYPE,
        precision: c.NUMERIC_PRECISION,
        character_maximum_length: c.CHARACTER_MAXIMUM_LENGTH,
        udt_name: c.UDT_NAME || '',
        is_nullable: c.IS_NULLABLE === 'NO' ? 'NO' : 'YES',
        is_key: primaryKeys.includes(c.COLUMN_NAME),
      }
      return i
    })
  }

  async getPrimaryKeys(schema: string, tableName: string): Promise<string[]> {
    const primaryKeyColumns = await this.knex.knex.raw(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1
      AND TABLE_SCHEMA = ? AND TABLE_NAME = ?;
      `,
      [schema, tableName],
    )

    return primaryKeyColumns.map((pk: any) => pk.COLUMN_NAME)
  }

  async getUniqueInfo(schema: string) {
    const uniqueInfo = await this.knex.knex.raw(
      `
      SELECT 
        tc.TABLE_SCHEMA,
        tc.TABLE_NAME,
        kcu.COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu 
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE 
        tc.CONSTRAINT_TYPE = 'UNIQUE';
      `,
      [schema],
    )

    return uniqueInfo.map((c: any) => ({
      table_schema: c.TABLE_SCHEMA,
      table_name: c.TABLE_NAME,
      column_name: c.COLUMN_NAME,
    }))
  }

  async getForeignKeys() {
    const foreignKeys = await this.knex.knex.raw(
      `
      SELECT 
        fk.name AS foreign_key_name,
        tp.name AS parent_table,
        cp.name AS parent_column,
        tr.name AS referenced_table,
        cr.name AS referenced_column
      FROM 
        sys.foreign_keys AS fk
        INNER JOIN sys.foreign_key_columns AS fkc 
          ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.tables AS tp 
          ON fkc.parent_object_id = tp.object_id
        INNER JOIN sys.columns AS cp 
          ON fkc.parent_object_id = cp.object_id 
          AND fkc.parent_column_id = cp.column_id
        INNER JOIN sys.tables AS tr 
          ON fkc.referenced_object_id = tr.object_id
        INNER JOIN sys.columns AS cr 
          ON fkc.referenced_object_id = cr.object_id 
          AND fkc.referenced_column_id = cr.column_id;
      `,
    )

    return foreignKeys.map((fk: any) => ({
      table_schema: 'dbo', // adjust as necessary
      table_name: fk.parent_table,
      column_name: fk.parent_column,
      foreign_table_schema: 'dbo', // adjust as necessary
      foreign_table_name: fk.referenced_table,
      foreign_column_name: fk.referenced_column,
    }))
  }

  async getEnumDef(udt_name: string) {
    // MSSQL does not have native enum types like PostgreSQL,
    // so this method might be unnecessary depending on your use case.
    return []
  }
}
