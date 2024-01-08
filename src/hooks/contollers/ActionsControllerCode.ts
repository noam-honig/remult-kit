import { getEntitiesTypescriptPostgres } from '$lib/cli/getEntity'
import { write, read } from '@kitql/internals'
import { remult } from 'remult'

import { databases, type ConnectionInfo } from '../../lib/cli/db/databases'
import type { IDatabase } from '../../lib/cli/db/types'
import { Setting, SettingKey } from '../entities/Setting'

export async function check(connectionInfo: ConnectionInfo) {
  const db = await getDbFromConnectionInfo(connectionInfo)

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
    [db.schema],
    'NEVER',
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

const cache = new Map<string, IDatabase>()
export async function getDbFromConnectionInfo(connectionInfo: ConnectionInfo) {
  const { env } = await import('$env/dynamic/private')

  const key = JSON.stringify(connectionInfo)

  let dataProvider = cache.get(key)

  if (!dataProvider) {
    let db = databases[connectionInfo.db]
    if (db === databases.auto) {
      for (const key in databases) {
        if (Object.prototype.hasOwnProperty.call(databases, key)) {
          const element = (databases as any)[key]
          if (element === databases.auto) continue
          const arg = Object.keys(element.args)?.[0]
          if (arg && env[element.args[arg].envName]) {
            db = element
            break
          }
        }
      }
    }
    const { connect } = db
    if (!connect) {
      throw Error('database not supported')
    }

    const args = connectionInfo.args
    for (const argKey in db.args) {
      if (!args[argKey]) {
        args[argKey] = env[(db.args as any)[argKey].envName]
      }
    }

    dataProvider = await connect(args)
    cache.set(key, dataProvider)
  }
  return dataProvider
}
