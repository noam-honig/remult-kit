import { BackendMethod } from 'remult'

export class ActionsController {
  @BackendMethod({ allowed: true })
  static async check() {
    const m = await import('./ActionsControllerCode')
    return m.check()
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
}
