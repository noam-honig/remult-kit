import { Entity, Fields } from 'remult'

export const enum SettingKey {
  outputDir = 'outputDir',
  tableProps = 'tableProps',
}

@Entity('settings', {
  allowApiCrud: true,
})
export class Setting {
  @Fields.string()
  id!: string

  @Fields.string()
  value!: string
}
