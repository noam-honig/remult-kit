import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
import type { IDatabase } from '$lib/cli/db/types'

export async function identifyDbBasedOnEnv(): Promise<keyof typeof databases> {
  const { env } = await import('$env/dynamic/private')
  for (const key in databases) {
    if (Object.prototype.hasOwnProperty.call(databases, key)) {
      const element = (databases as any)[key]
      if (element === databases['Select a Data Provider']) continue
      const arg = Object.keys(element.args)?.[0]
      if (arg && env[element.args[arg].envName]) {
        return key as keyof typeof databases
      }
    }
  }
  return 'Select a Data Provider'
}

const cache = new Map<string, IDatabase>()
export async function getDbFromConnectionInfo(connectionInfo: ConnectionInfo) {
  const { env } = await import('$env/dynamic/private')

  const key = JSON.stringify(connectionInfo)

  let dataProvider = cache.get(key)

  if (!dataProvider) {
    const db = databases[connectionInfo.db]

    const { connect } = db
    if (!connect) {
      throw Error('database not supported')
    }

    const args = connectionInfo.args
    for (const argKey in db.args) {
      if ((args[argKey] ?? '').trim().length === 0) {
        args[argKey] = env[(db.args as any)[argKey].envName]
      }
      if ((args[argKey] ?? '').trim() === '') {
        Reflect.deleteProperty(args, argKey)
      }
    }

    dataProvider = await connect(args)
    await dataProvider.test()
    cache.set(key, dataProvider)
  }
  return dataProvider
}
