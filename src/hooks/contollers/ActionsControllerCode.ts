import { env } from '$env/dynamic/private'
import { DbMySQL } from '$lib/cli/db/DbMySQL'
import { DbPostgres } from '$lib/cli/db/DbPostgres'
import type { IDatabase } from '$lib/cli/db/types'
import { getEntitiesTypescriptPostgres } from '$lib/cli/getEntity'
import { write, read } from '@kitql/internals'
import { remult } from 'remult'

import { Setting, SettingKey } from '../entities/Setting'

export async function check() {
  const connectionString = env.DATABASE_URL

  let db: IDatabase | null = null
  try {
    if (connectionString.startsWith('postgres')) {
      db = new DbPostgres()
    } else if (connectionString.startsWith('mysql')) {
      db = new DbMySQL()
    } else {
      throw new Error('connectionString should start with postgresql or mysql')
    }
    await db.init(connectionString)
  } catch (error) {
    console.error(`error`, error)
    throw new Error('Could not connect to the database, check your connectionString')
  }

  const repo = remult.repo(Setting)
  const all = await repo.find()
  const outputDir = all.find(c => c.id === SettingKey.outputDir)?.value ?? 'src/shared'
  const tableProps = all.find(c => c.id === SettingKey.tableProps)?.value ?? "'allowApiCrud: true'"

  const toRet = await getEntitiesTypescriptPostgres(
    db,
    outputDir,
    tableProps,
    ['order', 'name'],
    {},
    true,
    ['public'],
    'SMART',
    ['pg_stat_statements', 'pg_stat_statements_info'],
  )

  return toRet
}

export async function readFile(pathFile: string) {
  return (read(pathFile) ?? '').split('\n')
}

export async function writeFile(pathFile: string, data: string[]) {
  return write(pathFile, data)
}
