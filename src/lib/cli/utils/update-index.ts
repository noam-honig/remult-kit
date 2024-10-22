import fs from 'fs'
import path from 'path'

import { read, write } from '@kitql/internals'

export function updateIndex({
  targetTSFile = 'index.ts',
  entityClassName,
  entityFileName,
}: {
  targetTSFile?: string
  entityClassName: string
  entityFileName: string
}) {
  const targetFilePath = path.resolve(process.cwd(), targetTSFile)

  // Let's create the file if it doesn't exist
  if (!fs.existsSync(targetFilePath)) {
    write(targetFilePath, [])
  }

  let fileContent = read(targetFilePath) ?? ''

  // Calculate the relative path for the import
  const targetDir = path.dirname(targetFilePath)
  const entityFilePath = path.resolve(process.cwd(), entityFileName)
  const relativePath = path.relative(targetDir, entityFilePath).replaceAll('\\', '/')
  const importPath =
    (relativePath.startsWith('.') ? relativePath : './' + relativePath).replace(/\.ts$/, '') + '.js'

  // Update regular expressions
  const entityInArrayRegex = new RegExp(
    `entities\\s*=\\s*\\[([^\\]]*\\b${entityClassName}\\b[^\\]]*)]`,
    's',
  )
  const entityImportRegex = new RegExp(
    `^import\\s*{\\s*${entityClassName}\\s*}\\s*from\\s*['"]${importPath}['"];?\\s*$`,
    'm',
  )

  const hasEntityInArray = entityInArrayRegex.test(fileContent)
  const hasEntityImport = entityImportRegex.test(fileContent)

  // If the entityClassName is not found in the entities array, add it
  if (!hasEntityInArray) {
    const entitiesArrayRegex = /entities\s*=\s*\[([^]*?)]/
    const match = entitiesArrayRegex.exec(fileContent)

    if (match) {
      // Insert the entityClassName into the array
      const entities = match[1]
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
      if (!entities.includes(entityClassName)) {
        entities.push(entityClassName)
      }
      const newArrayContent = entities.sort().join(', ')
      fileContent = fileContent.replace(match[0], `entities = [${newArrayContent}]`)
    } else {
      // If the entities array doesn't exist, add it at the end of the file
      fileContent += `\nexport const entities = [${entityClassName}];`
    }
  }

  // If the entityClassName import is not found, add it
  if (!hasEntityImport) {
    const importStatement = `import { ${entityClassName} } from '${importPath}';\n`

    // Check if there are any existing imports
    const firstImportIndex = fileContent.indexOf('import ')
    if (firstImportIndex !== -1) {
      // Insert the new import after the last import
      const lastImportIndex = fileContent.lastIndexOf('import ')
      const endOfLastImport = fileContent.indexOf('\n', lastImportIndex) + 1
      fileContent =
        fileContent.slice(0, endOfLastImport) + importStatement + fileContent.slice(endOfLastImport)
    } else {
      // No existing imports, add at the top of the file
      fileContent = importStatement + fileContent
    }
  }

  // Write the updated content back to the file
  write(targetFilePath, [fileContent])
}
