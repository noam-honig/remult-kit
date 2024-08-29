import { BackendMethod, remult } from 'remult'
import { read, write } from '@kitql/internals'

import { type ConnectionInfo } from '$lib/cli/db/databases'
import { getEntitiesTypescriptFromDb, type EntityMetaData } from '$lib/cli/getEntity'
import { Setting, SettingKey } from '$shared/entities/Setting'

import { getDbFromConnectionInfo } from './helper'

export class ActionsController {
  @BackendMethod({ allowed: true })
  static async getDbEntitiesMetadata(connectionInfo: ConnectionInfo): Promise<{
    entities: {
      fileContent: string
      meta: EntityMetaData
    }[]
  }> {
    try {
      const db = await getDbFromConnectionInfo(connectionInfo)

      const repo = remult.repo(Setting)
      const all = await repo.find()
      const outputDir =
        all.find((c) => c.id === SettingKey.outputDir)?.value ?? 'src/shared/entities'
      const tableProps =
        all.find((c) => c.id === SettingKey.tableProps)?.value ?? "'allowApiCrud: true'"

      const toRet = await getEntitiesTypescriptFromDb(
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
    } catch (error) {
      return { entities: [] }
    }
  }

  @BackendMethod({ allowed: true })
  static async readFile(pathFile: string) {
    return (read(pathFile) ?? '').split('\n')
  }

  @BackendMethod({ allowed: true })
  static async writeFile(pathFile: string, data: string[]) {
    return write(pathFile, data)
  }

  @BackendMethod({ allowed: true })
  static async checkConnection(connectionInfo: ConnectionInfo) {
    const db = await getDbFromConnectionInfo(connectionInfo)
    await db.test()
    return true
  }

  @BackendMethod({ allowed: true })
  static async execute(connectionInfo: ConnectionInfo) {
    const db = await getDbFromConnectionInfo(connectionInfo)
    // db.execute()
    return `NOT YET`
  }
}
