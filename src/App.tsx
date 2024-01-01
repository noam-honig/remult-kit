import { useEffect, useMemo, useState } from "react"
import "./App.css"
import type { ColumnInfo, TableInfo, TheServer } from "./shared/get-definition"
import { FieldOptions, Fields } from "remult"
import { createTableEntity } from "./table-utils/createTableEntity"
import SelectConnection from "./components/select-connection"
import { ConnectionInfo, databases } from "./components/databases"

function App() {
  const [data, setData] = useState<TableInfo[]>()
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    db: "auto",
    args: {},
  })
  const [err, setError] = useState()

  const server = useMemo(() => {
    return new Proxy<TheServer>({} as any, {
      get: (target, methodName) => {
        return async (...args: any[]) => {
          const r = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionInfo, args, methodName }),
          })
          if (r.ok) {
            const json = await r.json()
            return json
          } else {
            throw await r.text()
          }
        }
      },
    })
  }, [])

  return (
    <div className="App">
      <SelectConnection
        connectionInfo={connectionInfo}
        setConnectionInfoInfo={setConnectionInfo}
      />
      <button
        onClick={async () => {
          try {
            setError(undefined)
            setData(undefined)
            setData(await server.getTables())
          } catch (err: any) {
            setError(err)
          }
        }}
      >
        Get Tables
      </button>
      {err && (
        <pre style={{ color: "red" }}>{JSON.stringify(err, null, 2)}</pre>
      )}

      {data?.map((table) => (
        <div>
          <h4>{table.name}</h4>
          <ShowTableInfo
            schema={table.schema}
            name={table.name}
            server={server}
          />
        </div>
      ))}
    </div>
  )
}

export default App

function ShowTableInfo({
  schema,
  name: tableName,
  server,
}: {
  schema: string
  name: string
  server: TheServer
}) {
  const [data, setData] = useState<ColumnInfo[]>()
  useEffect(() => {
    server.getTableInfo(schema, tableName).then(setData).catch(setData)
  }, [])
  const result = useMemo(() => {
    return createTableEntity(tableName, data)
  }, [data])

  return (
    <div className="App">
      <pre>{result}</pre>
    </div>
  )
}

export interface buildInfo {
  fieldType: keyof typeof Fields | null
  dataType: string
  defaultValue: any
  options: FieldOptions
  memberName: string
}
