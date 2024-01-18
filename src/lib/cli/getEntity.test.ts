import { config } from 'dotenv'
import { createPostgresDataProvider } from 'remult/postgres'
import { createKnexDataProvider } from 'remult/remult-knex'
import { expect, test, describe, it } from 'vitest'

import { DbMySQL } from './db/DbMySQL.js'
import { DbPostgres } from './db/DbPostgres.js'
import type { IDatabase } from './db/types.js'
import { buildColumn, getEntitiesTypescriptPostgres } from './getEntity.js'

config()

describe('#unit-test build_column', () => {
  test('string not nullable wo default val', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'name',
      isNullable: 'NO',
      type: 'string',
      defaultVal: null,
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string()
				name!: string"
		`)
  })

  test('string nullable wo default val', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'name',
      isNullable: 'YES',
      type: 'string',
      defaultVal: null,
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string({ allowNull: true })
				name?: string"
		`)
  })

  test('string nullable w default val', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'name',
      isNullable: 'YES',
      type: 'string',
      defaultVal: "'Hello World'",
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string({ allowNull: true })
				name? = 'Hello World'"
		`)
  })

  test('password', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'password',
      isNullable: 'NO',
      type: 'string',
      defaultVal: null,
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string({ includeInApi: false, inputType: 'password' })
				password!: string"
		`)
  })

  test('email', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'email',
      isNullable: 'YES',
      type: 'string',
      defaultVal: null,
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string({ allowNull: true, inputType: 'email' })
				email?: string"
		`)
  })

  test('decorator_import', () => {
    const info = buildColumn({
      decorator: '@Relations.toOne#remult',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'email',
      isNullable: 'YES',
      type: 'string',
      defaultVal: null,
    })
    expect(info.decorator_import).toMatchInlineSnapshot('"import { Relations } from \'remult\'"')
  })
})

const DATABASE_URL = process.env['DATABASE_URL']
describe.skipIf(!DATABASE_URL)('#unit-test build_column', () => {
  it('test1', async () => {
    const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
    await x.execute('drop table if exists test1')
    await x.execute(
      "create table test1 (id int default 0 not null, name varchar(100) default '' not null)",
    )
    const result = await getTypescript(new DbPostgres(x), 'test1')
    expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1s", {
          dbName: "test1",
        })
        export class Test1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
  })
})

describe.skipIf(!process.env['MSSQL_PASSWORD'])('test sql server', async () => {
  it('test a basic table', async () => {
    const x = await createKnexDataProvider({
      // Knex client configuration for MSSQL
      client: 'mssql',
      connection: {
        server: '127.0.0.1',
        database: process.env['MSSQL_DATABASE'],
        user: 'sa',
        password: process.env['MSSQL_PASSWORD'],
        options: {
          enableArithAbort: true,
          encrypt: false,
          instanceName: process.env['MSSQL_INSTANCE'],
        },
      }, //,debug: true
    })
    try {
      await x.knex.raw('drop table test1')
    } catch (e) {}
    await x.knex.raw(
      "create table test1 (id int default 0 not null, name varchar(100) default '' not null)",
    )
    const result = await getTypescript(new DbMySQL(x, 'dbo'), 'test1')
    expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1s", {
          dbName: "test1",
        })
        export class Test1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
  })
})

async function getTypescript(db: IDatabase, entity: string) {
  const r = await getEntitiesTypescriptPostgres(
    db,
    '',
    '',
    [],
    {},
    false,
    [db.schema],
    'NEVER',
    [],
    [entity],
  )
  const result = r.entities.find(x => x.meta.table.dbName == 'test1')!.fileContent
  return result
}
