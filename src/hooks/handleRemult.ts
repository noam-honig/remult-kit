import { JsonDataProvider, repo } from 'remult'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from 'remult/server'

import { ActionsController } from '$shared/contollers/ActionsController'
import { Setting, SettingKey } from '$shared/entities/Setting'

// One day maybe!
// const dynamicEntities = []
// try {
//   const files = getFilesUnder('./src/shared/entities')

//   for (let i = 0; i < files.length; i++) {
//     const className = files[i].replaceAll('.ts', '')
//     /* @vite-ignore */
//     const imp = await import('../shared/entities/' + className)
//     dynamicEntities.push(imp[className])
//   }
// } catch (error) {}

// const u = await import('../shared/entities/User')

export const handleRemult = remultSveltekit({
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
