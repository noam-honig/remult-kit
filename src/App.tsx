import { useEffect, useMemo, useState } from "react"
import "./App.css"
import { ColumnInfo, GetDefinition, TableInfo } from "./shared/get-definition"
import { FieldOptions, Fields } from "remult"

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
    let cols = ""
    let props = []
    props.push("allowApiCrud: true")
    if (tableName.toLocaleLowerCase() != tableName) {
      //  props.push("dbName: '\"" + table + "\"'");
    }

    let first: string = undefined!
    for (const {
      memberName,
      defaultValue,
      options,
      fieldType,
      dataType,
      info,
    } of (data ?? []).map((info) => ({ ...processColumn(info), info }))) {
      if (!first) first = memberName
      cols += "\n\n  @Fields." + fieldType + `()\n  ` + memberName
      if (!defaultValue) {
        cols += "!"
        cols += ": "
        cols += dataType
      }
      if (defaultValue) cols += " = " + defaultValue
      //cols += ` // ${info.type}`
    }
    props.push(`defaultOrderBy: { ${first}: "asc" }`)
    let r =
      `import { Entity, Fields } from "remult"
    
@Entity<${tableName}>("${tableName}", { \n  ${props.join(",\n  ")} \n})
export class ${tableName} {` +
      cols +
      "\n}".replace("  ", "")
    return r
  }, [data])

  return (
    <div className="App">
      <pre>{result}</pre>
    </div>
  )
}

export interface buildInfo {
  fieldType: keyof typeof Fields
  dataType: string
  defaultValue: any
  options: FieldOptions
  memberName: string
}

function processColumn({
  type,
  datetime_precision,
  name,
  maxLength,
  column_default,
}: ColumnInfo) {
  let result: buildInfo = {
    fieldType: "string",
    defaultValue: "''",
    options: {},
    memberName: name,
    dataType: "",
  }

  switch (type) {
    case "decimal":
    case "real":
    case "int":
    case "smallint":
    case "tinyint":
    case "bigint":
    case "float":
    case "numeric":
    case "NUMBER":
    case "money":
      if (datetime_precision === 0) result.fieldType = "integer"
      else result.fieldType = "number"
      result.defaultValue = 0
      break
    case "nchar":
    case "nvarchar":
    case "ntext":
    case "NVARCHAR2":
    case "text":
    case "varchar":
    case "VARCHAR2":
      break
    case "char":
    case "CHAR":
      if (maxLength == 8 && column_default == "('00000000')") {
        result.fieldType = "dateOnly"
        result.dataType = "Date"
        result.defaultValue = undefined
      }
      break
    case "DATE":
    case "datetime":
    case "datetime2":
    case "timestamp without time zone":
      result.fieldType = "date"
      result.dataType = "Date"
      result.defaultValue = undefined
      break
    case "bit":
      result.fieldType = "boolean"
      result.defaultValue = false
      break
    default:
      break
  }
  return result
}
