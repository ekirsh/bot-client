/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

