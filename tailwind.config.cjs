// const colors = require('tailwindcss/colors')
const svelte_ux = require('svelte-ux/plugins/tailwind.cjs')
const { themes } = require('svelte-ux/styles/daisy')

/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,svelte}', './node_modules/svelte-ux/**/*.{svelte,js}'],
  ux: {
    themes,
    // themes: {
    //   light: {
    //     primary: colors['blue']['500'],
    //     'primary-content': 'white',
    //     secondary: colors['cyan']['300'],
    //     'surface-100': 'white',
    //     'surface-200': colors['gray']['100'],
    //     'surface-300': colors['gray']['300'],
    //     'surface-content': colors['gray']['900'],
    //   },
    // },
  },
  theme: {
    extend: {},
  },
  plugins: [svelte_ux],
}

module.exports = config
