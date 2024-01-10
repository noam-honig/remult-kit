import type { ConnectionInfo } from '$lib/cli/db/databases'
import { writable } from 'svelte/store'

import { ActionsController } from '../../hooks/contollers/ActionsController'

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
      update(y => ({ ...y, ...{ status: '???' } }))

      try {
        if (await ActionsController.checkConnection(input)) {
          input = { ...input, status: 'good', error: '' }
        }
      } catch (err: any) {
        input = { ...input, status: 'bad', error: err.message }
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
