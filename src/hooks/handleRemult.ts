import { ActionsController } from '$shared/contollers/ActionsController'
import { Setting, SettingKey } from '$shared/entities/Setting'
import { JsonDataProvider } from 'remult'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from 'remult/server'

export const handleRemult = remultSveltekit({
  dataProvider: async () => new JsonDataProvider(new JsonEntityFileStorage('.remult-kit')),
  logApiEndPoints: false,
  entities: [Setting],
  controllers: [ActionsController],
  initApi: async remult => {
    const repo = remult.repo(Setting)

    // reset all settings
    // const all = await repo.find()
    // for (const setting of all) {
    //   await repo.delete(setting.id)
    // }
    if ((await repo.count()) === 0) {
      await repo.insert([
        { id: SettingKey.outputDir, value: 'src/shared' },
        { id: SettingKey.tableProps, value: 'allowApiCrud: true' },
      ])
    }
  },
})
