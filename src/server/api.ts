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
    // Prodive default values
    const defaultValues = {
      [SettingKey.schema]: 'public',
      [SettingKey.outputDir]: 'src/shared/entities',
      [SettingKey.tableProps]: 'allowApiCrud: true',
    }
    for (const [key, value] of Object.entries(defaultValues)) {
      const s = await repo(Setting).count({ id: key })
      if (s === 0) {
        await repo(Setting).insert({ id: key, value: value })
      }
    }

    // always set order and placeholder
    await repo(Setting).upsert({
      where: { id: SettingKey.schema },
      set: { order: 0, placeholder: 'schema name or * for all schemas' },
    })
    await repo(Setting).upsert({
      where: { id: SettingKey.outputDir },
      set: { order: 1 },
    })
    await repo(Setting).upsert({
      where: { id: SettingKey.tableProps },
      set: { order: 2 },
    })
  },
})
