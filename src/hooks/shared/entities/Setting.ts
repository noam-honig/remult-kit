import { Entity, Fields } from 'remult'

export const enum SettingKey {
  outputDir = 'outputDir',
  tableProps = 'tableProps',
}

@Entity('settings', {
  caption: '__remult-kit settings',
  allowApiCrud: true,
})
export class Setting {
  @Fields.string({ allowApiUpdate: false })
  id!: string

  @Fields.string()
  value!: string
}
