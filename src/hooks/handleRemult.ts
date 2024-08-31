import { JsonDataProvider } from 'remult'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from 'remult/server'
import { getFilesUnder } from '@kitql/internals'

import { ActionsController } from '$shared/contollers/ActionsController'
import { Setting, SettingKey } from '$shared/entities/Setting'

const dynamicEntities = []
try {
  const files = getFilesUnder('./src/shared/entities')

  for (let i = 0; i < files.length; i++) {
    const className = files[i].replaceAll('.ts', '')
    /* @vite-ignore */
    const imp = await import('../shared/entities/' + className)
    dynamicEntities.push(imp[className])
  }
} catch (error) {}

// const u = await import('../shared/entities/User')

export const handleRemult = remultSveltekit({
  dataProvider: async () => new JsonDataProvider(new JsonEntityFileStorage('.remult-kit')),
  logApiEndPoints: false,
  entities: [
    Setting,
    ...dynamicEntities,
    // u.User,
  ],
  controllers: [ActionsController],
  admin: true,
  initApi: async (remult) => {
    const repo = remult.repo(Setting)

    // reset all settings
    // const all = await repo.find()
    // for (const setting of all) {
    //   await repo.delete(setting.id)
    // }

    if ((await repo.count()) === 0) {
      await repo.insert([
        { id: SettingKey.outputDir, value: 'src/shared/entities' },
        { id: SettingKey.tableProps, value: 'allowApiCrud: true' },
      ])
    }
  },
})
