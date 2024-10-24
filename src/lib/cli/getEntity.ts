// import { mkdirSync, rmSync, writeFileSync } from 'fs'
import prettier from 'prettier'

import { DbTable, type DbTableForeignKey } from './db/DbTable.js'
import { processColumnType } from './db/processColumnType.js'
import type { IDatabase } from './db/types.js'
import { kababToConstantCase, toCamelCase, toPascalCase, toTitleCase } from './utils/case.js'
import { toFnAndImport } from './utils/format.js'

type CliColumnInfo = {
  col: string
  decorator_fn: string
  decorator_import: string | null
}

// TODO: ColMetaData vs FieldInfo??? should be ONE
type ColMetaData = {
  type: string | null
  forceTypeToBePresent?: boolean
  decorator: string
  defaultVal: string | null
  decoratorArgsValueType: string
  decoratorArgsOptions?: string[]
  columnName: string
  columnNameTweak?: string
  isNullable: 'YES' | 'NO'
  foreignField?: string | null
  comment: string | null
}

export function buildColumn({
  type,
  forceTypeToBePresent,
  decorator,
  defaultVal,
  decoratorArgsValueType,
  decoratorArgsOptions = [],
  columnNameTweak,
  columnName,
  isNullable,
  foreignField,
  comment,
}: ColMetaData): CliColumnInfo {
  if (foreignField) {
    if (foreignField !== 'NO_NEED_TO_SPECIFY_FIELD') {
      decoratorArgsOptions.unshift(`field: '${foreignField}'`)
    }
  } else {
    if (columnNameTweak || columnName === 'order' || columnName === 'from') {
      decoratorArgsOptions.unshift(`dbName: '"${columnName}"'`)
    }
  }

  if (isNullable === 'YES' && !foreignField) {
    decoratorArgsOptions.push(`allowNull: true`)
  }

  const decoratorArgs = []
  if (decoratorArgsValueType) {
    decoratorArgs.push(decoratorArgsValueType)
  }

  // by default, let's not publish a field "password"
  if (columnName.toLowerCase().includes('password')) {
    decoratorArgsOptions.push(`includeInApi: false`)
    decoratorArgsOptions.push(`inputType: 'password'`)
  } else if (columnName.toLowerCase().includes('email')) {
    decoratorArgsOptions.push(`inputType: 'email'`)
  } else if (columnName.toLowerCase().includes('color')) {
    decoratorArgsOptions.push(`inputType: 'color'`)
  }

  if (decoratorArgsOptions.length > 0) {
    decoratorArgs.push(`{ ${decoratorArgsOptions.join(', ')} }`)
  }

  const { str_fn: decorator_fn, str_import: decorator_import } = toFnAndImport(decorator)

  const commentToUse = comment ? `\t// ${comment}\n` : ''

  let current_col = `${commentToUse}\t${decorator_fn}(${decoratorArgs.join(', ')})\n\t${
    columnNameTweak ? columnNameTweak : columnName
  }`

  if (isNullable === 'YES') {
    current_col += '?'
  }
  if (isNullable !== 'YES' && !defaultVal) {
    current_col += '!'
  }

  // let's add the type only if we have it and if we don't have a default value
  if ((!defaultVal && type) || forceTypeToBePresent) {
    current_col += ': '
    current_col += type
  }
  if (defaultVal) {
    current_col += ' = ' + defaultVal
  }

  return { col: current_col, decorator_fn, decorator_import }
}

export type EntityMetaData = {
  table: DbTable
  enums: Record<string, string[]>
  props: string[]
  cols: string[]
  colsMeta: ColMetaData[]
  additionalImports: string[]
  entitiesImports: string[]
  usesValidators: boolean
  toManys: {
    addOn: string
    ref: string
    refField: string
    table_key: string
    columnNameTweak: string
  }[]
}
export async function getEntitiesTypescriptFromDb(
  db: IDatabase,
  outputDir: string,
  tableProps: string,
  orderBy?: string[],
  customDecorators: Record<string, string> = {},
  withEnums: boolean = true,
  schemas: (string | undefined)[] = [],
  schemasPrefix: 'NEVER' | 'ALWAYS' | 'SMART' = 'SMART',
  exclude: string[] = [],
  include: string[] = [],
) {
  const tableInfo = await db.getTablesInfo()

  if (tableInfo.length === 0) {
    throw new Error('No table found in the database')
  }

  const foreignKeys = await db.getForeignKeys()

  const allTables = tableInfo.map((table) => {
    const tableForeignKeys = foreignKeys.filter(({ table_name }) => table.table_name === table_name)
    return new DbTable(table.table_name, table.table_schema, schemasPrefix, tableForeignKeys)
  })

  const getEntities: EntityMetaData[] = []
  await Promise.all(
    allTables
      // let's generate schema by schema
      .filter((c) =>
        (schemas.length === 1 && schemas[0] === '*') || schemas.length == 0
          ? true
          : schemas.includes(c.schema),
      )
      .map(async (table) => {
        try {
          if (
            !exclude.includes(table.dbName) &&
            (include.length === 0 || include.includes(table.dbName))
          ) {
            getEntities.push({
              ...(await getEntityTypescript(
                allTables,
                db,
                table.schema,
                table,
                tableProps,
                customDecorators,

                // report,
                orderBy,
              )),
              entitiesImports: [],
            })
          }
        } catch (error) {
          // console.error(error)
        }
      }),
  )

  const allToManys = getEntities.flatMap((e) => e.toManys)

  const toRet: { entities: { fileContent: string; meta: EntityMetaData }[] } = {
    entities: [],
  }

  const sortedTablesO = getEntities.sort((a, b) =>
    a.table.className.localeCompare(b.table.className),
  )

  const enums: string[] = []
  sortedTablesO.forEach((ent) => {
    const additionalImports = []

    const toManys = allToManys
      .filter((tm) => tm.addOn === ent.table.dbName)
      .sort((a, b) => a.table_key.localeCompare(b.table_key))
      .map((tm) => {
        const number_of_ref = allToManys.filter(
          (c) => c.addOn === ent.table.dbName && c.ref === tm.ref,
        ).length

        const currentCol = buildColumn({
          decorator: '@Relations.toMany#remult',
          decoratorArgsValueType: `() => ${tm.ref}`,
          isNullable: 'YES',
          defaultVal: null,
          type: `${tm.ref}[]`,
          columnName: number_of_ref === 1 ? tm.table_key : `${tm.table_key}Of${tm.columnNameTweak}`,
          foreignField: number_of_ref === 1 ? 'NO_NEED_TO_SPECIFY_FIELD' : tm.refField,
          comment: null,
        })

        ent.entitiesImports.push(tm.ref)
        if (currentCol.decorator_import) {
          additionalImports.push(currentCol.decorator_import)
        }

        return currentCol.col + '\n'
      })

    const cols = ent.cols
    if (toManys.length > 0) {
      cols.push('    // Relations toMany', ...toManys)
    }
    additionalImports.push(...ent.additionalImports)

    ent.entitiesImports.push(
      ...[
        ...ent.table.foreignKeys.map(
          ({ foreignDbName }) => allTables.find((t) => t.dbName === foreignDbName)!.className,
        ),
      ].filter((c) => c !== ent.table.className),
    )
    const entityString = generateEntityString(
      allTables,
      ent.table,
      ent.enums,
      ent.props,
      cols,
      additionalImports,
      ent.entitiesImports,
      ent.usesValidators,
    )

    const enumsStrings = generateEnumsStrings(ent.enums)

    toRet.entities.push({ fileContent: entityString, meta: ent })

    // writeFileSync(`${entities_path}${ent.table.className}.ts`, entityString)

    if (withEnums) {
      enumsStrings.forEach(({ enumName, enumString }) => {
        enums.push(enumName)
        // writeFileSync(`${enums_path}${enumName}.ts`, enumString)
      })
    }
  })
  for (const r of toRet.entities) {
    try {
      r.fileContent = await prettier.format(r.fileContent, {
        parser: 'typescript',
        semi: false,
      })
    } catch (err) {
      r.fileContent = `/* prettier failed to format this file\n${err} */\n\n` + r.fileContent
    }
  }

  const sortedTables = getEntities
    .map((e) => e.table)
    .slice()
    .sort((a, b) => a.className.localeCompare(b.className))

  return toRet
}

async function getEntityTypescript(
  allTables: DbTable[],
  db: IDatabase,
  schema: string | undefined,
  table: DbTable,
  tableProps: string,
  customDecorators: Record<string, string>,
  orderBy?: (string | number)[],
) {
  const enums: Record<string, string[]> = {}
  const additionalImports: string[] = []

  const cols: string[] = []
  const colsMeta: ColMetaData[] = []
  const props = []
  const toManys = []
  if (tableProps) props.push(tableProps)

  const dbNameToUse = db.getRemultEntityDbName(table)
  if (dbNameToUse) {
    props.push(`dbName: '${dbNameToUse}'`)
  }

  let usesValidators = false
  let defaultOrderBy: string | null = null
  const columnWithId: string[] = []

  const uniqueInfo = await db.getUniqueInfo(schema)
  for (const dbCol2 of await db.getTableColumnInfo(schema, table.dbName)) {
    const fieldInfo = await processColumnType({
      ...dbCol2,
      enums,
      db,
      table,
    })
    if (fieldInfo.db.is_key) {
      columnWithId.push(fieldInfo.db.column_name)
    }
    if (
      uniqueInfo.find(
        (u) =>
          u.table_schema === schema &&
          u.table_name === table.dbName &&
          u.column_name === fieldInfo.db.column_name,
      )
    ) {
      usesValidators = true
      fieldInfo.decoratorArgsOptions.push('validate: [Validators.unique]')
    }

    const decorator = customDecorators[fieldInfo.decorator] ?? fieldInfo.decorator

    // TODO: extract this logic from the process column
    // if (fieldInfo.enumAdditionalName) {
    //   await handleEnums(enums, 'USER-DEFINED', db, fieldInfo.enumAdditionalName)
    // }
    // await handleEnums(enums, fieldInfo.db.data_type, db, fieldInfo.db.udt_name)

    if (!defaultOrderBy && orderBy?.includes(fieldInfo.db.column_name)) {
      defaultOrderBy = fieldInfo.db.column_name
    }

    const colMeta: ColMetaData = {
      decorator,
      decoratorArgsValueType: fieldInfo.decoratorArgsValueType,
      decoratorArgsOptions: fieldInfo.decoratorArgsOptions,
      columnName: fieldInfo.db.column_name,
      isNullable: fieldInfo.db.is_nullable,
      type: fieldInfo.type,
      forceTypeToBePresent: fieldInfo.forceTypeToBePresent,
      defaultVal: fieldInfo.defaultVal,
      comment: fieldInfo.comment,
    }
    const currentCol = buildColumn(colMeta)
    if (currentCol.decorator_import) {
      additionalImports.push(currentCol.decorator_import)
    }
    cols.push(currentCol.col + `\n`)
    colsMeta.push(colMeta)

    const foreignKey = table.foreignKeys.find((f) => f.columnName === fieldInfo.db.column_name)
    if (foreignKey) {
      const { columnNameTweak } = handleForeignKeyCol(
        allTables,
        foreignKey,
        fieldInfo.db.column_name,
        additionalImports,
        cols,
        fieldInfo.db.is_nullable,
      )

      const toMany = {
        addOn: foreignKey.foreignDbName,
        ref: table.className,
        refField: fieldInfo.db.column_name,
        table_key: table.key,
        columnNameTweak,
        // columnName:
        // 	columnNameTweak === toCamelCase(foreignKey.foreignDbName)
        // 		? `${table.key}`
        // 		: `${table.key}Of${columnNameTweak}`,
      }
      toManys.push(toMany)
    }
  }

  if (defaultOrderBy) {
    props.push(`defaultOrderBy: { ${defaultOrderBy}: 'asc' }`)
  }

  if (!columnWithId.includes('id') && columnWithId.length > 0) {
    if (columnWithId.length === 1) {
      if (colsMeta.length > 0 && colsMeta[0].columnName !== columnWithId[0]) {
        props.push(`id: '${columnWithId[0]}'`)
      }
    } else {
      props.push(`id: [${columnWithId.map((c) => `'${c}'`).join(', ')} ]`)
    }
  }

  return {
    table,
    enums,
    props,
    cols,
    colsMeta,
    additionalImports,
    usesValidators,
    toManys,
  } as const
}

function addLineIfNeeded(array: string[], format?: (item: string) => string) {
  if (array.length === 0) {
    return ``
  }

  if (!format) {
    return `\n${array.join('\n')}`
  }

  return `\n${array.map(format).join('\n')}`
}

const handleForeignKeyCol = (
  allTables: DbTable[],
  foreignKey: DbTableForeignKey,
  columnName: string,
  additionalImports: string[],
  cols: string[],
  isNullable: 'YES' | 'NO',
) => {
  let columnNameTweak = columnName.replace(/_id$/, '').replace(/Id$/, '')

  const f = allTables.find((t) => t.dbName === foreignKey.foreignDbName)!

  // If after the light tweak, the column name is the same as before,
  // let's go to another strategy, className + columnName (let's be very explicit to avoid colision)
  if (columnNameTweak === columnName) {
    columnNameTweak = toCamelCase(f.className) + toPascalCase(columnName)
  }

  const currentColFk = buildColumn({
    decorator: '@Relations.toOne#remult',
    decoratorArgsValueType: `() => ${f.className}`,
    columnNameTweak,
    columnName,
    isNullable,
    type: f.className,
    defaultVal: null,
    foreignField: columnName,
    comment: null,
  })

  if (currentColFk.decorator_import) {
    additionalImports.push(currentColFk.decorator_import)
  }

  if (currentColFk) {
    cols.push(currentColFk.col + `\n`)
  }

  return { columnNameTweak }
}

const generateEntityString = (
  allTables: DbTable[],
  table: DbTable,
  enums: Record<string, string[]>,
  props: string[],
  cols: string[],
  additionalImports: string[],
  entitiesImports: string[],
  usesValidators: boolean,
) => {
  const isContainsForeignKeys = table.foreignKeys.length > 0
  const foreignClassNamesToImport = entitiesImports

  const enumsKeys = Object.keys(enums)

  return (
    `import { Entity, ${isContainsForeignKeys || enumsKeys.length > 0 ? 'Field, ' : ''}Fields${
      usesValidators ? ', Validators' : ''
    } } from 'remult'` +
    `${addLineIfNeeded([...new Set(additionalImports)])}` +
    `${addLineIfNeeded([...new Set(foreignClassNamesToImport)], (c) => `import { ${c} } from './${c}.js'`)}` +
    `${addLineIfNeeded(enumsKeys, (c) => `import { ${c} } from '../enums'`)}

@Entity<${table.className}>('${table.key}', {\n\t${props.join(',\n\t')}\n})
export class ${table.className} {
${cols.join(`\n`)}}
`
  )
}

const generateEnumsStrings = (enums: Record<string, string[]>) => {
  const res: { enumName: string; enumString: string }[] = []

  for (const enumName in enums) {
    const enumValues = enums[enumName]

    res.push({
      enumName,
      enumString: `import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class ${enumName} {
  ${enumValues
    ?.map((e) => `static ${kababToConstantCase(e)} = new ${enumName}('${e}', '${toTitleCase(e)}')`)
    .join('\n  ')}

  constructor(public id: string, public caption: string) {}
}
`,
    })
  }

  return res
}
