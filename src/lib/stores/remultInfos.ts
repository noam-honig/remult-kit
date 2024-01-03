import type { EntityMetaData } from '$lib/cli/getEntity'
import { writable, type Writable } from 'svelte/store'

export const remultInfos: Writable<{
  entities: { fileContent: string; meta: EntityMetaData }[]
}> = writable({ entities: [] })
