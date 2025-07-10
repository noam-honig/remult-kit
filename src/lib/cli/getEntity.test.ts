import { config } from 'dotenv'
import { beforeEach, describe, expect, it, test } from 'vitest'

import { createPostgresDataProvider } from 'remult/postgres'
import { createKnexDataProvider } from 'remult/remult-knex'

import { DbMsSQL } from './db/DbMsSQL.js'
import { DbMySQL } from './db/DbMySQL.js'
import { DbPostgres } from './db/DbPostgres.js'
import { DbSQLite } from './db/DbSQLite.js'
import type { IDatabase } from './db/types.js'
import { buildColumn, getEntitiesTypescriptFromDb } from './getEntity.js'

config()

describe('field generation', () => {
  test('string not nullable wo default val', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'name',
      isNullable: 'NO',
      type: 'string',
      defaultVal: null,
      comment: null,
    })
    expect(info.col).toMatchInlineSnapshot(`
			"	@Fields.string()
				name!: string"
		`)
  })

  test('Adding a comment', () => {
    const info = buildColumn({
      decorator: '@Fields.string',
      decoratorArgsValueType: '',
      decoratorArgsOptions: [],
      columnName: 'name',
      isNullable: 'NO',
      type: 'string',
      defaultVal: null,
      comment: 'Very nice one!',
    })
    expect(info.col).toMatchInlineSnapshot(`
      "	// Very nice one!
      	@Fields.string()
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
      comment: null,
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
      comment: null,
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
      comment: null,
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
      comment: null,
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
      comment: null,
    })
    expect(info.decorator_import).toMatchInlineSnapshot('"import { Relations } from \'remult\'"')
  })
})

describe.sequential('db', () => {
  const DATABASE_URL = process.env['DATABASE_URL']
  describe.skipIf(!DATABASE_URL)('Postgres (env DATABASE_URL needed)', () => {
    it('test a basic table', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists test1')
      await x.execute(
        "create table test1 (id int default 0 not null, name varchar(100) default '' not null)",
      )
      const result = await getTypescript(new DbPostgres(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a basic table plural in db, singular in code', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists tests')
      await x.execute(
        `create table tests (id int default 0 not null, name varchar(100) default '' not null)`,
      )
      const result = await getTypescript(new DbPostgres(x), 'tests')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test>("tests", {})
        export class Test {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a basic table with CAPITAL LETTERS', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists "TEST1"')
      await x.execute(
        `create table "TEST1" (id int default 0 not null, name varchar(100) default '' not null)`,
      )
      const result = await getTypescript(new DbPostgres(x), 'TEST1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<TEST1>("TEST1", {})
        export class TEST1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a products', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists test1')
      await x.execute(
        `CREATE TABLE test1 (
          "ProductID" SERIAL PRIMARY KEY,
          "ProductName" VARCHAR(40) NOT NULL,
          "SupplierID" INT NOT NULL DEFAULT 0,
          "CategoryID" INT NOT NULL DEFAULT 0,
          "QuantityPerUnit" VARCHAR(20) NOT NULL DEFAULT '',
          "ProductColor" VARCHAR(20) NOT NULL DEFAULT '',
          "UnitPrice" DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
          "UnitsInStock" SMALLINT NOT NULL DEFAULT 0,
          "UnitsOnOrder" SMALLINT NOT NULL DEFAULT 0,
          "ReorderLevel" SMALLINT NOT NULL DEFAULT 0,
          "Discontinued" BOOLEAN NOT NULL DEFAULT FALSE
        );`,
      )
      const result = await getTypescript(new DbPostgres(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.autoIncrement()
          ProductID = 0

          @Fields.string()
          ProductName!: string

          @Fields.integer()
          SupplierID = 0

          @Fields.integer()
          CategoryID = 0

          @Fields.string()
          QuantityPerUnit = ""

          @Fields.string({ inputType: "color" })
          ProductColor = ""

          @Fields.number()
          UnitPrice!: number

          @Fields.integer()
          UnitsInStock = 0

          @Fields.integer()
          UnitsOnOrder = 0

          @Fields.integer()
          ReorderLevel = 0

          @Fields.boolean()
          Discontinued = false
        }
        "
      `)
    })
    it('test a name with space', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists "test it1"')
      await x.execute(
        `CREATE TABLE "test it1" (
          id INT NOT NULL DEFAULT 0,
          name VARCHAR(100) NOT NULL DEFAULT ''
        );`,
      )
      const result = await getTypescript(new DbPostgres(x), 'test it1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<TestIt1>("test-it1s", {
          dbName: "test it1",
        })
        export class TestIt1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a products & orders', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists orders')
      await x.execute('drop table if exists products')
      await x.execute(
        `CREATE TABLE products (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(40) NOT NULL,
          "price" DECIMAL(19, 4) NOT NULL DEFAULT 0.0000
        );`,
      )

      await x.execute(
        `CREATE TABLE orders (
          "id" SERIAL PRIMARY KEY, 
          "productId" INT NOT NULL,
          "qte" INT NOT NULL DEFAULT 0,
          CONSTRAINT fk_product FOREIGN KEY("productId") REFERENCES products("id")
        );`,
      )
      const resultP = await getEntityInfo(new DbPostgres(x), 'products')
      expect(resultP?.meta.entitiesImports).toMatchInlineSnapshot(`
        [
          "Order",
        ]
      `)
      expect(resultP?.fileContent).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"
        import { Relations } from "remult"
        import { Order } from "./Order.js"

        @Entity<Product>("products", {})
        export class Product {
          @Fields.autoIncrement()
          id = 0

          @Fields.string()
          name!: string

          @Fields.number()
          price!: number

          // Relations toMany
          @Relations.toMany(() => Order)
          orders?: Order[]
        }
        "
      `)

      const resultO = await getEntityInfo(new DbPostgres(x), 'orders')
      expect(resultO?.meta.entitiesImports).toMatchInlineSnapshot(`
        [
          "Product",
        ]
      `)
      expect(resultO?.fileContent).toMatchInlineSnapshot(`
        "import { Entity, Field, Fields } from "remult"
        import { Relations } from "remult"
        import { Product } from "./Product.js"

        @Entity<Order>("orders", {})
        export class Order {
          @Fields.autoIncrement()
          id = 0

          @Fields.integer()
          productId!: number

          @Relations.toOne(() => Product, { field: "productId" })
          product!: Product

          @Fields.integer()
          qte = 0
        }
        "
      `)
    })
    it('test uuid id & unique', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists test1')
      await x.execute(
        `CREATE TABLE test1 (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(40) NOT NULL UNIQUE
        );`,
      )
      const result = await getTypescript(new DbPostgres(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields, Validators } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.uuid()
          id!: string

          @Fields.string({ validate: [Validators.unique] })
          name!: string
        }
        "
      `)
    })
    it('test function as default value', async () => {
      const x = await createPostgresDataProvider({ connectionString: DATABASE_URL })
      await x.execute('drop table if exists test1')
      await x.execute(
        `CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE TABLE test1 (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid()
        );`,
      )

      const result = await getTypescript(new DbPostgres(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.uuid()
          id = ""
        }
        "
      `)
    })
  })

  describe.skipIf(!process.env['MSSQL_DATABASE'])('mssql (env MSSQL_DATABASE needed)', async () => {
    const x = await createKnexDataProvider({
      // Knex client configuration for MSSQL
      client: 'mssql',
      connection: {
        server: process.env['MSSQL_SERVER'] ?? '127.0.0.1',
        database: process.env['MSSQL_DATABASE'],
        user: 'sa',
        password: process.env['MSSQL_PASSWORD'],
        options: {
          enableArithAbort: true,
          encrypt: false,
          instanceName: process.env['MSSQL_INSTANCE'],
        },
      },
    })

    beforeEach(async () => {
      try {
        await x.knex.raw('DROP TABLE IF EXISTS test1')
      } catch (e) { }
    })

    it('test a basic table', async () => {
      await x.knex.raw(
        "CREATE TABLE test1 (id INT DEFAULT 0 NOT NULL, name VARCHAR(100) DEFAULT '' NOT NULL)",
      )
      const result = await getTypescript(new DbMsSQL(x, 'dbo'), 'test1')

      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a case sensitive table table', async () => {
      await x.knex.raw('DROP TABLE IF EXISTS EMPLOYEE')
      await x.knex.raw(
        "CREATE TABLE EMPLOYEE (id INT DEFAULT 0 NOT NULL, name VARCHAR(100) DEFAULT '' NOT NULL)",
      )
      const result = await getTypescript(new DbMsSQL(x, 'dbo'), 'EMPLOYEE')

      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<EMPLOYEE>("EMPLOYEE", {})
        export class EMPLOYEE {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })

    it('test a products table', async () => {
      await x.knex.raw(
        `CREATE TABLE test1(
            [ProductID] [int] NOT NULL PRIMARY KEY,
            [ProductName] [varchar](40) NOT NULL,
            [SupplierID] [int] NOT NULL DEFAULT ((0)),
            [CategoryID] [int] NOT NULL DEFAULT ((0)),
            [QuantityPerUnit] [varchar](20) NOT NULL DEFAULT (''),
            [UnitPrice] [money] NOT NULL DEFAULT ((0)),
            [UnitsInStock] [smallint] NOT NULL DEFAULT ((0)),
            [UnitsOnOrder] [smallint] NOT NULL DEFAULT ((0)),
            [ReorderLevel] [smallint] NOT NULL DEFAULT ((0)),
            [Discontinued] [bit] NOT NULL DEFAULT ((0))
          )`,
      )
      const result = await getTypescript(new DbMsSQL(x, 'dbo'), 'test1')

      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.integer()
          ProductID!: number

          @Fields.string()
          ProductName!: string

          @Fields.integer()
          SupplierID = 0

          @Fields.integer()
          CategoryID = 0

          @Fields.string()
          QuantityPerUnit = ""

          @Fields.number()
          UnitPrice = 0

          @Fields.integer()
          UnitsInStock = 0

          @Fields.integer()
          UnitsOnOrder = 0

          @Fields.integer()
          ReorderLevel = 0

          @Fields.boolean()
          Discontinued = false
        }
        "
      `)
    })

    it('test a name with space', async () => {
      try {
        await x.knex.raw('DROP TABLE IF EXISTS [test it1]')
      } catch (e) { }
      await x.knex.raw(
        `CREATE TABLE [test it1] (
            id INT DEFAULT 0 NOT NULL,
            name VARCHAR(100) DEFAULT '' NOT NULL
          )`,
      )
      const result = await getTypescript(new DbMsSQL(x, 'dbo'), 'test it1')

      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<TestIt1>("test-it1s", {
          dbName: "test it1",
        })
        export class TestIt1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
  })

  describe.skipIf(!process.env['MYSQL_DATABASE'])('MySQL (env MYSQL_DATABASE needed)', async () => {
    const x = await createKnexDataProvider({
      // Knex client configuration for MSSQL
      client: 'mysql2',
      connection: {
        user: process.env['MYSQL_USER'],
        password: process.env['MYSQL_PASSWORD'],
        host: process.env['MYSQL_HOST'],
        database: process.env['MYSQL_DATABASE'],
        port: 3306,
      },
    })
    beforeEach(async () => {
      try {
        await x.knex.raw('drop table test1')
      } catch (e) { }
    })

    it('test a basic table', async () => {
      await x.knex.raw(
        "create table test1 (id int default 0 not null, name varchar(100) default '' not null)",
      )
      const result = await getTypescript(
        new DbMySQL(x, process.env['MYSQL_DATABASE'] ?? ''),
        'test1',
      )
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
    it('test a products', async () => {
      await x.knex.raw(
        `CREATE TABLE test1 (
          ProductID INT NOT NULL PRIMARY KEY,
          ProductName VARCHAR(40) NOT NULL,
          SupplierID INT NOT NULL DEFAULT 0,
          CategoryID INT NOT NULL DEFAULT 0,
          QuantityPerUnit VARCHAR(20) NOT NULL DEFAULT '',
          UnitPrice DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
          UnitsInStock SMALLINT NOT NULL DEFAULT 0,
          UnitsOnOrder SMALLINT NOT NULL DEFAULT 0,
          ReorderLevel SMALLINT NOT NULL DEFAULT 0,
          Discontinued BIT NOT NULL DEFAULT 0
        )`,
      )
      const result = await getTypescript(
        new DbMySQL(x, process.env['MYSQL_DATABASE'] ?? ''),
        'test1',
      )
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {})
        export class Test1 {
          @Fields.integer()
          ProductID!: number

          @Fields.string()
          ProductName!: string

          @Fields.integer()
          SupplierID = 0

          @Fields.integer()
          CategoryID = 0

          @Fields.string()
          QuantityPerUnit = ""

          @Fields.number()
          UnitPrice = 0.0

          @Fields.integer()
          UnitsInStock = 0

          @Fields.integer()
          UnitsOnOrder = 0

          @Fields.integer()
          ReorderLevel = 0

          @Fields.boolean()
          Discontinued = false
        }
        "
      `)
    })
    it('test a name with space', async () => {
      try {
        await x.knex.raw(`DROP TABLE IF EXISTS \`test it1\`;`)
      } catch (e) { }
      await x.knex.raw(
        `CREATE TABLE \`test it1\` (
          id INT NOT NULL DEFAULT 0,
          name VARCHAR(100) NOT NULL DEFAULT ''
        )`,
      )
      const result = await getTypescript(
        new DbMySQL(x, process.env['MYSQL_DATABASE'] ?? ''),
        'test it1',
      )
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<TestIt1>("test-it1s", {
          dbName: "test it1",
        })
        export class TestIt1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
  })

  describe('SQLite', async () => {
    const x = await createKnexDataProvider({
      client: 'sqlite3',
      connection: {
        filename: 'src/lib/cli/db/sqlite3/dev.db',
      },
      useNullAsDefault: true, //,debug: true
    })
    beforeEach(async () => {
      try {
        await x.knex.raw('drop table test1')
      } catch (e) { }
    })

    it('test a basic table', async () => {
      await x.knex.raw(
        "create table test1 (id int default 0 not null, name varchar(100) default '' not null)",
      )
      const result = await getTypescript(new DbSQLite(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {
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
    it('test a products', async () => {
      await x.knex.raw(
        `CREATE TABLE test1(
        [ProductID] [int] NOT NULL primary key,
        [ProductName] [varchar](40) NOT NULL,
        [SupplierID] [int] NOT NULL DEFAULT ((0)),
        [CategoryID] [int] NOT NULL DEFAULT ((0)),
        [QuantityPerUnit] [varchar](20) NOT NULL DEFAULT (''),
        [UnitPrice] [money] NOT NULL DEFAULT ((0)),
        [UnitsInStock] [smallint] NOT NULL DEFAULT ((0)),
        [UnitsOnOrder] [smallint] NOT NULL DEFAULT ((0)),
        [ReorderLevel] [smallint] NOT NULL DEFAULT ((0)),
        [Discontinued] [bit] NOT NULL DEFAULT ((0))
      )`,
      )
      const result = await getTypescript(new DbSQLite(x), 'test1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<Test1>("test1", {
          dbName: "test1",
        })
        export class Test1 {
          @Fields.integer()
          ProductID!: number

          @Fields.string()
          ProductName!: string

          @Fields.integer()
          SupplierID = 0

          @Fields.integer()
          CategoryID = 0

          @Fields.string()
          QuantityPerUnit = ""

          @Fields.number()
          UnitPrice = 0

          @Fields.integer()
          UnitsInStock = 0

          @Fields.integer()
          UnitsOnOrder = 0

          @Fields.integer()
          ReorderLevel = 0

          @Fields.boolean()
          Discontinued = false
        }
        "
      `)
    })
    it('test a name with space', async () => {
      try {
        await x.knex.raw('drop table [test it1]')
      } catch (e) { }
      await x.knex.raw(
        "create table [test it1] (id int default 0 not null, name varchar(100) default '' not null)",
      )
      const result = await getTypescript(new DbSQLite(x), 'test it1')
      expect(result).toMatchInlineSnapshot(`
        "import { Entity, Fields } from "remult"

        @Entity<TestIt1>("test-it1s", {
          dbName: "test it1",
        })
        export class TestIt1 {
          @Fields.integer()
          id = 0

          @Fields.string()
          name = ""
        }
        "
      `)
    })
  })
})

async function getTypescript(db: IDatabase, entity: string) {
  const result = await getEntityInfo(db, entity)

  if (!result) return `NO DATA FOR ENTITY "${entity}"`
  const fileContent = result.fileContent
  return fileContent
}
async function getEntityInfo(db: IDatabase, entity: string) {
  const r = await getEntitiesTypescriptFromDb(db, '', '', [], {}, false, [db.schema], 'NEVER', [])

  const result = r.entities.find((x) => {
    // console.log(`x.meta.table.dbName`, x.meta.table.dbName, entity)
    return x.meta.table.dbName == entity
  })
  return result
}
