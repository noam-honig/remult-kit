import { remultExpress } from "remult/remult-express"
import { createPostgresDataProvider } from "remult/postgres"
import { GetDefinition } from "../shared/get-definition"
import { createKnexDataProvider } from "remult/remult-knex"

export const api = remultExpress({
  // dataProvider: createKnexDataProvider({
  //   // Knex client configuration for MSSQL
  //   client: "mssql",
  //   connection: {
  //     server: "127.0.0.1",
  //     database: "test2",
  //     user: "sa",
  //     password: "MASTERKEY",
  //     options: {
  //       enableArithAbort: true,
  //       encrypt: false,
  //       instanceName: "sqlexpress",
  //     },
  //   }, //,debug: true
  // }),
  dataProvider: createPostgresDataProvider({
    connectionString: "postgres://postgres:MASTERKEY@localhost/postgres",
  }),
  controllers: [GetDefinition],
})
