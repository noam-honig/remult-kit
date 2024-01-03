import { ColumnInfo } from "../shared/get-definition"
import { buildInfo } from "../App"

export function processColumn({
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
    case "boolean":
      result.fieldType = "boolean"
      result.defaultValue = false
      break
    default:
      result.fieldType = null
      break
  }
  return result
}
