import { writable } from 'svelte/store'

import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
import { ActionsController } from '$shared/controllers/ActionsController'

import { remultInfos } from './remultInfos'

const def: ConnectionInfo = {
  db: 'Select a Data Provider',
  args: {},
  status: '???',
}

function load() {
  const x = sessionStorage.getItem('connectionInfo')

  if (x) return JSON.parse(x) as ConnectionInfo
  return def
}
function save(x: ConnectionInfo) {
  if (x.status === 'good') sessionStorage.setItem('connectionInfo', JSON.stringify(x))
}

function createStore() {
  const { subscribe, set: localSet, update } = writable<ConnectionInfo>(load())

  const check = async (input: ConnectionInfo) => {
    update((y) => ({ ...y, ...{ status: 'checking' }, ...{ error: '' } }))

    try {
      const c = await ActionsController.checkConnection(input)
      if (databases[c.db].isSelect) {
        input = { ...def }
      } else if (c.error) {
        input = { ...input, status: 'bad', error: c.error, db: c.db }
      } else {
        input = { ...input, status: 'good', error: '', db: c.db }
      }
    } catch (err: any) {
      remultInfos.set({ entities: [] })
    }
    save(input)
    localSet(input)
    return input
  }

  check(load())

  return {
    subscribe,

    set: (x: ConnectionInfo) => {
      save(x)
      localSet(x)
    },

    check,

    reset(db: ConnectionInfo['db']) {
      const x = { ...def, db } as const
      save(x)
      localSet(x)
    },
  }
}

export const connectionInfo = createStore()
