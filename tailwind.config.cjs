const colors = require('tailwindcss/colors')
const svelte_ux = require('svelte-ux/plugins/tailwind.cjs')

/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,svelte}', './node_modules/svelte-ux/**/*.{svelte,js}'],
  theme: {
    extend: {
      colors: {
        accent: '#0F2C69',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [svelte_ux],
}

module.exports = config
