import pluralize from 'pluralize'

import { toCamelCase, toPascalCase } from '../utils/case.js'
import type { DbForeignKey } from './types.js'

export interface DbTableForeignKey {
  columnName: string
  foreignDbName: string
}

export class DbTable {
  schema: string | undefined
  dbName: string
  key: string
  className: string
  foreignKeys: DbTableForeignKey[]

  constructor(
    dbName: string,
    schema: string | undefined,
    schemasPrefix: 'NEVER' | 'ALWAYS' | 'SMART' = 'SMART',
    foreignKeys: DbForeignKey[],
  ) {
    this.schema = schema
    this.dbName = dbName

    this.foreignKeys = foreignKeys.map(({ foreign_table_name, column_name: columnName }) => {
      return {
        columnName,
        foreignDbName: foreign_table_name,
      }
    })

    const rmvSpaceDbName = dbName
      .split(' ')
      .map((c) => toPascalCase(c))
      .join('')

    const sing = toPascalCase(pluralize.singular(rmvSpaceDbName))

    if (schemasPrefix === 'NEVER') {
      this.className = sing
    } else if (schemasPrefix === 'ALWAYS') {
      this.className = schema ? `${toPascalCase(schema)}_${sing}` : sing
    } else {
      if (schema === 'public') {
        this.className = sing
      } else {
        this.className = schema ? `${toPascalCase(schema)}_${sing}` : sing
      }
    }

    // if db name has invalid chars, let's create a cool key
    const invalidDbNameChars = [' ']
    if (invalidDbNameChars.some((c) => this.dbName.includes(c))) {
      this.key = toCamelCase(pluralize.plural(this.dbName)).replaceAll(' ', '-')
    } else {
      this.key = this.dbName
    }
  }
}
