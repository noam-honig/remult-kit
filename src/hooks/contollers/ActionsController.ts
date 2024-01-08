import { BackendMethod } from 'remult'

import type { ConnectionInfo } from '../../lib/cli/db/databases'

export class ActionsController {
  @BackendMethod({ allowed: true })
  static async check(connectionInfo: ConnectionInfo) {
    const m = await import('./ActionsControllerCode')
    return m.check(connectionInfo)
  }

  @BackendMethod({ allowed: true })
  static async writeFile(pathFile: string, data: string[]) {
    const m = await import('./ActionsControllerCode')
    return m.writeFile(pathFile, data)
  }

  @BackendMethod({ allowed: true })
  static async readFile(pathFile: string) {
    const m = await import('./ActionsControllerCode')
    return await m.readFile(pathFile)
  }
  @BackendMethod({ allowed: true })
  static async checkConnection(connectionInfo: ConnectionInfo) {
    ;(
      await (await import('./ActionsControllerCode')).getDbFromConnectionInfo(connectionInfo)
    ).test()

    return true
  }
}
