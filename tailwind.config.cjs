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
          // dark
          // dim
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#0066c8',
          // secondary: '#5B68DF',
          // accent: '#74E0A9',
        },
      },
    ],
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}

module.exports = config
