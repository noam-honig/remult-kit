import { useEffect, useMemo, useState } from "react"
import "./App.css"
import { ColumnInfo, GetDefinition, TableInfo } from "./shared/get-definition"
import { FieldOptions, Fields } from "remult"
import { createTableEntity } from "./table-utils/createTableEntity"

function App() {
  const [data, setData] = useState<TableInfo[]>()
  useEffect(() => {
    GetDefinition.getTables().then(setData).catch(setData)
  }, [])

  return (
    <div className="App">
      {data?.map((table) => (
        <div>
          <h4>{table.name}</h4>
          <ShowTableInfo schema={table.schema} name={table.name} />
        </div>
      ))}
    </div>
  )
}

export default App

function ShowTableInfo({
  schema,
  name: tableName,
}: {
  schema: string
  name: string
}) {
  const [data, setData] = useState<ColumnInfo[]>()
  useEffect(() => {
    GetDefinition.getTableInfo(schema, tableName).then(setData).catch(setData)
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
