import type { IDatabase } from './types'

export type ConnectionInfo = {
  db: keyof typeof databases
  args: any
}

export const databases = {
  auto: build({
    args: {},
    npm: [],
    getCode: () => ``,
    connect: async (args: any) => {
      throw new Error('Could not determine database based on environment variables')
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
    getCode: args => `
import { createPostgresDataProvider } from "remult/postgres"

createPostgresDataProvider({
  connectionString: ${args['database url']}
})
  `,
    connect: async args => {
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
    getCode: args => `
import { createKnexDataProvider } from "remult/remult-knex"
createKnexDataProvider({
  client: "mysql2",
  connection: {
    user: ${args.user},
    password: ${args.password},
    host: ${args.host},
    database: ${args.database},
    port: ${args.port},
  },
})
    `,
    connect: async args => {
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
    getCode: args => `
import { createKnexDataProvider } from "remult/remult-knex"
createKnexDataProvider({
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
  },
  `,
    connect: async args => {
      const { createKnexDataProvider } = await import('remult/remult-knex')
      const { DbMySQL } = await import('./DbMySQL')
      return new DbMySQL(
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

export function load() {
  const x = sessionStorage.getItem('connectionInfo')
  if (x) return JSON.parse(x) as ConnectionInfo
  return {
    db: 'auto',
    args: {},
  } as ConnectionInfo
}
export function save(x: ConnectionInfo) {
  sessionStorage.setItem('connectionInfo', JSON.stringify(x))
}
