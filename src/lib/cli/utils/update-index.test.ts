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
    entityFileName: `/shared/entities/${entity}.js`,
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
