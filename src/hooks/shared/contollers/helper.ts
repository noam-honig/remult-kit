import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
import type { IDatabase } from '$lib/cli/db/types'

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
