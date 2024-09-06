import { writable } from 'svelte/store'

import type { ConnectionInfo } from '$lib/cli/db/databases'
import { ActionsController } from '$shared/contollers/ActionsController'

import { remultInfos } from './remultInfos'

const def: ConnectionInfo = {
  db: 'auto',
  args: {},
  status: '???',
}

function load() {
  const x = sessionStorage.getItem('connectionInfo')
  if (x) return JSON.parse(x) as ConnectionInfo
  return def
}
function save(x: ConnectionInfo) {
  sessionStorage.setItem('connectionInfo', JSON.stringify(x))
}

function createStore() {
  const { subscribe, set: localSet, update } = writable<ConnectionInfo>(load())

  return {
    subscribe,

    set: (x: ConnectionInfo) => {
      save(x)
      localSet(x)
    },

    check: async (input: ConnectionInfo) => {
      update((y) => ({ ...y, ...{ status: '???' } }))

      try {
        if (await ActionsController.checkConnection(input)) {
          input = { ...input, status: 'good', error: '' }
          remultInfos.set(await ActionsController.getDbEntitiesMetadata(input))
        }
      } catch (err: any) {
        input = { ...input, status: 'bad', error: err.message }
        remultInfos.set({ entities: [] })
      }

      save(input)
      localSet(input)
    },

    reset(db: ConnectionInfo['db']) {
      const x = { ...def, db }
      save(x)
      localSet(x)
    },
  }
}

export const connectionInfo = createStore()
