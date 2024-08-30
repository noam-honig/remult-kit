import { writable, type Writable } from 'svelte/store'

import type { EntityMetaData } from '$lib/cli/getEntity'

export const remultInfos: Writable<{
  entities: { fileContent: string; meta: EntityMetaData }[]
}> = writable({ entities: [] })
