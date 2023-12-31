import { remultExpress } from "remult/remult-express"
import { createPostgresDataProvider } from "remult/postgres"
import { GetDefinition } from "../shared/get-definition"

export const api = remultExpress({
  dataProvider: createPostgresDataProvider({
    connectionString: "postgres://postgres:MASTERKEY@localhost/postgres",
  }),
  controllers: [GetDefinition],
})
