import { BackendMethod, remult } from 'remult'
import { read, write } from '@kitql/internals'

import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
import { getEntitiesTypescriptFromDb, type EntityMetaData } from '$lib/cli/getEntity'
import { updateIndex } from '$lib/cli/utils/update-index'
import { Setting, SettingKey } from '$shared/entities/Setting'

import { getDbFromConnectionInfo, identifyDbBasedOnEnv } from './helper'

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
  static async writeFiles(files: { className: string; data: string[] }[]) {
    for (let i = 0; i < files.length; i++) {
      const { className, data } = files[i]
      const outDir = (await remult.repo(Setting).findId(SettingKey.outputDir))?.value || ''
      const pathFile = `${outDir}/${className}.ts`
      updateIndex({
        targetTSFile: `${outDir}/index.ts`,
        entityClassName: className,
        entityFileName: pathFile,
      })
      write(pathFile, data)
    }
  }

  @BackendMethod({ allowed: true })
  static async checkConnection(
    connectionInfo: ConnectionInfo,
  ): Promise<{ db: keyof typeof databases; error?: string }> {
    let db: keyof typeof databases = connectionInfo.db

    if (databases[db].isSelect) {
      db = await identifyDbBasedOnEnv()
    }
    if (databases[connectionInfo.db].isSelect) {
      return {
        db,
      }
    } else {
      try {
        const dp = await getDbFromConnectionInfo(connectionInfo)
        await dp.test()
        return { db }
      } catch (e: any) {
        return {
          db,
          error: e.message,
        }
      }
    }
  }
}
