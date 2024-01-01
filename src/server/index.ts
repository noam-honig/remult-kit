import express from "express"
import { ConnectionInfo, databases } from "../components/databases"
import { TheServer, getStrategy } from "../shared/get-definition"
import { config } from "dotenv"
config()

export const app = express()

const cache = new Map<string, any>()

app.post("/api/execute", express.json(), async (req, res) => {
  const connectionInfo: ConnectionInfo = req.body.connectionInfo
  const key = JSON.stringify(connectionInfo)
  try {
    let dataProvider = cache.get(key)

    if (!dataProvider) {
      let db = databases[connectionInfo.db]
      if (db === databases.auto) {
        for (const key in databases) {
          if (Object.prototype.hasOwnProperty.call(databases, key)) {
            const element = (databases as any)[key]
            if (element === databases.auto) continue
            const arg = Object.keys(element.args)?.[0]
            if (arg && process.env[element.args[arg].envName]) {
              db = element
              break
            }
          }
        }
      }
      const { connect } = db
      if (!connect) {
        res.status(400).send("database not supported")
        return
      }

      const args = connectionInfo.args
      for (const argKey in db.args) {
        if (!args[argKey]) {
          args[argKey] = process.env[(db.args as any)[argKey].envName]
        }
      }

      dataProvider = await connect(args)
      cache.set(key, dataProvider)
    }
    const strategy = await getStrategy(dataProvider)
    res.json(
      await (strategy[req.body.methodName as keyof TheServer] as any)(
        ...req.body.args
      )
    )
  } catch (err: any) {
    res.status(400).send(err.message)
    console.error(err)
    cache.delete(key)
  }
})

const frontendFiles = process.cwd() + "/node_modules/remult-kit/dist"
app.use(express.static(frontendFiles))
app.get("/*", (_, res) => {
  res.sendFile(frontendFiles + "/index.html")
})
app.listen(process.env["PORT"] || 3002, () => console.log("Server started"))

const port = 3003
app.listen(port, () =>
  console.log(
    "remult-kit started on port " + port + " - http://localhost:" + port + "/"
  )
)
