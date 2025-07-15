import { kitql } from '@kitql/eslint-config'

/** @type { import("eslint").Linter.Config[] } */
export default [
  ...kitql({ pnpmCatalogs: { enable: false } }),
  {
    name: 'app:rules',
    rules: {
      // Some custom things?
    },
  },
]
