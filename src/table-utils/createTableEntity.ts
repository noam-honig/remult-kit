import { ColumnInfo } from "../shared/get-definition"
import { processColumn } from "./processColumn"

export function createTableEntity(
  tableName: string,
  data: ColumnInfo[] | undefined
) {
  let cols = ""
  let props = []
  props.push("allowApiCrud: true")
  if (tableName.toLocaleLowerCase() != tableName) {
    //  props.push("dbName: '\"" + table + "\"'");
  }

  let first: string = undefined!
  for (let { memberName, defaultValue, options, fieldType, dataType, info } of (
    data ?? []
  ).map((info) => ({ ...processColumn(info), info }))) {
    if (!first) first = memberName
    if (fieldType == null) {
      console.log(`/* ${JSON.stringify(info, undefined, 2)} */`)
      fieldType = "string"
    }
    cols += "\n\n  @Fields." + fieldType + `()\n  ` + memberName
    if (defaultValue === undefined) {
      cols += "!"
      cols += ": "
      cols += dataType
    } else cols += " = " + defaultValue
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
}
