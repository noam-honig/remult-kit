import { remultExpress } from "remult/remult-express"
import { createPostgresDataProvider } from "remult/postgres"
import { GetDefinition } from "../shared/get-definition"
import { createKnexDataProvider } from "remult/remult-knex"

export const api = remultExpress({
  dataProvider: createKnexDataProvider({
    // Knex client configuration for Postgres
    client: "pg",
    connection: "postgres://postgres:MASTERKEY@localhost/postgres",
  }),
  controllers: [GetDefinition],
})
