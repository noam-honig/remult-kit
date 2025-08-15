import { JsonDataProvider, repo } from 'remult'
import { remultApi } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from 'remult/server'

import { ActionsController } from '$shared/controllers/ActionsController'
import { Setting, SettingKey } from '$shared/entities/Setting'

export const api = remultApi({
  dataProvider: async () => new JsonDataProvider(new JsonEntityFileStorage('.remult-kit')),

  logApiEndPoints: false,
  entities: [
    Setting,
    // ...dynamicEntities,
  ],
  controllers: [ActionsController],
  admin: true,
  initApi: async () => {
    if ((await repo(Setting).count()) === 0) {
      await repo(Setting).insert([
        { id: SettingKey.outputDir, value: 'src/shared/entities' },
        { id: SettingKey.tableProps, value: 'allowApiCrud: true' },
      ])
    }
  },
})
