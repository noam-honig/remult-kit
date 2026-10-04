import { Entity, Fields } from 'remult'

export const enum SettingKey {
  outputDir = 'outputDir',
  tableProps = 'tableProps',
  schema = 'schema',
}

@Entity('settings', {
  caption: '__remult-kit settings',
  allowApiCrud: true,
  defaultOrderBy: { order: 'asc' },
})
export class Setting {
  @Fields.string({ allowApiUpdate: false })
  id!: string

  @Fields.string()
  value!: string

  @Fields.number()
  order = 0

  @Fields.string()
  placeholder = ''
}
