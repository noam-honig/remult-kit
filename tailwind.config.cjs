/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        remult: {
          // dracula
          // luxury
          // night
          // business
          // coffee
          // dim
          ...require('daisyui/src/theming/themes')['dim'],
          primary: '#029431',
          secondary: '#42B4E6',
          accent: '#D42A21',
        },
      },
    ],
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}

module.exports = config
