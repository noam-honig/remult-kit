import type { IDatabase } from './types'

export type ConnectionInfo = {
  db: keyof typeof databases
  args: any
  status: 'good' | 'bad' | '???' | 'checking'
  error?: string
}

export const databases = {
  auto: build({
    args: {},
    npm: [],
    getCode: () => ``,
    connect: async (args: any) => {
      throw new Error(
        'Could not determine database based on environment variables. Select a Data Provider.',
      )
    },
  }),
  postgres: build({
    args: {
      'database url': {
        envName: 'DATABASE_URL',
        label: 'Connection string',
        placeholder: 'postgres://user:password@host:port/database',
      },
    },
    npm: ['pg'],
    getCode: (args) => `import { createPostgresDataProvider } from "remult/postgres"

const dataProvider = createPostgresDataProvider({
  connectionString: ${args['database url']}
})`,
    connect: async (args) => {
      const { createPostgresDataProvider } = await import('remult/postgres')
      const { DbPostgres } = await import('./DbPostgres')
      return new DbPostgres(
        await createPostgresDataProvider({
          connectionString: args['database url'],
        }),
      )
    },
  }),
  mysql: build({
    args: {
      host: { envName: 'MYSQL_HOST' },
      port: { envName: 'MYSQL_PORT' },
      user: { envName: 'MYSQL_USER' },
      password: { envName: 'MYSQL_PASSWORD' },
      database: { envName: 'MYSQL_DATABASE' },
    },
    npm: ['mysql2', 'knex'],
    getCode: (args) => `import { createKnexDataProvider } from "remult/remult-knex"

const dataProvider = createKnexDataProvider({
  client: "mysql2",
  connection: {
    user: ${args.user},
    password: ${args.password},
    host: ${args.host},
    database: ${args.database},
    port: ${args.port},
  },
})`,
    connect: async (args) => {
      const { createKnexDataProvider } = await import('remult/remult-knex')
      const { DbMySQL } = await import('./DbMySQL')
      const db = await createKnexDataProvider({
        // Knex client configuration for MySQL
        client: 'mysql2',
        connection: {
          user: args.user,
          password: args.password,
          host: args.host,
          database: args.database,
          port: args.port ? parseInt(args.port) : undefined,
        },
      })
      const schema = await db.knex.raw('select DATABASE()')
      return new DbMySQL(db, schema[0][0]['DATABASE()' as any])
    },
  }),
  mssql: build({
    args: {
      server: { envName: 'MSSQL_SERVER' },
      database: { envName: 'MSSQL_DATABASE' },
      user: { envName: 'MSSQL_USER' },
      password: { envName: 'MSSQL_PASSWORD' },
      instanceName: { envName: 'MSSQL_INSTANCE' },
    },
    npm: ['tedious', 'knex'],
    getCode: (args) => `import { createKnexDataProvider } from "remult/remult-knex"

const dataProvider = createKnexDataProvider({
  client: "mssql",
  connection: {
    server: ${args.server},
    database: ${args.database},
    user: ${args.user},
    password: ${args.password},
    options: {
      enableArithAbort: true,
      encrypt: false,
      instanceName: ${args.instanceName},
    },
  }
})`,
    connect: async (args) => {
      const { createKnexDataProvider } = await import('remult/remult-knex')
      const { DbMsSQL } = await import('./DbMsSQL')
      return new DbMsSQL(
        await createKnexDataProvider({
          // Knex client configuration for MSSQL
          client: 'mssql',
          connection: {
            server: args.server,
            database: args.database,
            user: args.user,
            password: args.password,
            options: {
              enableArithAbort: true,
              encrypt: false,
              instanceName: args.instanceName,
            },
          },
        }),
        'dbo',
      )
    },
  }),
  sqlite: build({
    args: {
      database_path: { envName: 'DB_DATABASE' },
    },
    npm: ['better-sqlite3'],
    getCode: (args) => `import { SqlDatabase } from 'remult'
import Database from 'better-sqlite3'
import { BetterSqlite3DataProvider } from 'remult/remult-better-sqlite3'

const dataProvider = new SqlDatabase( 
  new BetterSqlite3DataProvider(new Database(${args.database_path}))
)`,
    connect: async (args) => {
      const { createKnexDataProvider } = await import('remult/remult-knex')
      const { DbSQLite } = await import('./DbSQLite')
      const db = await createKnexDataProvider({
        client: 'sqlite3',
        connection: {
          filename: args.database_path,
        },
      })
      // const schema = await db.knex.raw('PRAGMA database_list;')
      return new DbSQLite(db)
    },
  }),
}

function build<argsType>(options: {
  args: argsType
  npm: string[]
  getCode: (args: { [K in keyof argsType]: string }) => string
  connect: (args: {
    [K in keyof argsType]: string
  }) => Promise<IDatabase>
}) {
  return {
    ...options,
    getCode: (args: { [K in keyof argsType]: string }) => {
      const reducedArgs = Object.keys(options.args as any).reduce((acc, key) => {
        //@ts-ignore
        acc[key] = `process.env["${options.args[key].envName}"]`
        return acc
      }, {})
      return options.getCode(reducedArgs as any)
    },
  }
}
