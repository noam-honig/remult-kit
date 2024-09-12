import fs from 'fs'
import path from 'path'

export async function updateIndex({
  targetTSFile = 'index.ts',
  entityClassName,
  entityFileName,
}: {
  targetTSFile?: string
  entityClassName: string
  entityFileName: string
}) {
  const targetFilePath = path.resolve(process.cwd(), targetTSFile)

  // Ensure the file exists
  if (!fs.existsSync(targetFilePath)) {
    throw new Error(`File ${targetTSFile} does not exist.`)
  }

  let fileContent = fs.readFileSync(targetFilePath, 'utf-8')

  // Check if the entityClassName is already present in the file
  const entityInArrayRegex = new RegExp(
    `entities\\s*=\\s*\\[([^\\]]*${entityClassName}[^\\]]*)]`,
    's',
  )
  const entityImportRegex = new RegExp(
    `import\\s*{\\s*${entityClassName}\\s*}\\s*from\\s*['"].*${entityFileName}.*['"];`,
  )

  const hasEntityInArray = entityInArrayRegex.test(fileContent)
  const hasEntityImport = entityImportRegex.test(fileContent)

  // If the entityClassName is not found in the entities array, add it
  if (!hasEntityInArray) {
    // Check if the entities array is already declared in the file
    const entitiesArrayRegex = /entities\s*=\s*\[([^]*)]/
    const match = entitiesArrayRegex.exec(fileContent)

    if (match) {
      // Insert the entityClassName into the array
      const newArrayContent = `${match[1].trim()}, ${entityClassName}`
      fileContent = fileContent.replace(match[0], `entities = [${newArrayContent}]`)
    } else {
      // If the entities array doesn't exist, add it at the end of the file
      fileContent += `\n\nexport const entities = [${entityClassName}];`
    }
  }

  // If the entityClassName import is not found, add it
  if (!hasEntityImport) {
    const importStatement = `import { ${entityClassName} } from '${entityFileName}';\n`

    // Place the import at the top of the file
    fileContent = `${importStatement}${fileContent}`
  }

  // Write the updated content back to the file
  fs.writeFileSync(targetFilePath, fileContent, 'utf-8')
}
