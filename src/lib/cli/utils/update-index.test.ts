import fs from 'fs'
import { describe, expect, test } from 'vitest'

import { updateIndex } from './update-index'

async function myTest(entity: string, before: string) {
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp')
  }
  fs.writeFileSync('/tmp/test.ts', before)
  await updateIndex({
    targetTSFile: '/tmp/test.ts',
    entityClassName: entity,
    entityFileName: `/shared/entities/${entity}`,
  })
  return fs.readFileSync('/tmp/test.ts', 'utf8')
}

describe('#unit-test toFnAndImport', () => {
  test('does everything if file is empty', async () => {
    expect(await myTest('User', '')).toMatchInlineSnapshot(`
      "import { User } from '../shared/entities/User.js';

      export const entities = [User];"
    `)
  })
  test('repeat calls don"t break anything', async () => {
    const result = await myTest('User', '')
    expect(await myTest('User', result)).toBe(result)
  })
  test('repeat calls don"t break anything', async () => {
    const result = await myTest('User', '')
    expect(await myTest('Roles', result)).toMatchInlineSnapshot(`
      "import { User } from '../shared/entities/User.js';
      import { Roles } from '../shared/entities/Roles.js';

      export const entities = [Roles, User];"
    `)
  })

  test('adds an entity', async () => {})
})

// remult-kit
// done - fix forward slash + js
// done - fix lower first char (DEPTMNT=>that was dEPTMNT)
// As the bug of dEMPTMNT is fixed, maybe we don't need this? - fix ensure schema false by default
// half done - remove console logs on errors
//// removed a lot, but not all. (it's also a lot lighter)
//// Need to be done: Have a global error per type of type not handle (not one by one)
//// Need to send to the UI somewhere (and fully remove for console)
// todo - relations. Setting: With? Without? Bring all relations of the selected entity?

// todo - remult-admin - -f there is an error when loading a table - show the error in the table place
// todo - remult - fix auto caption in case of all capital letters
