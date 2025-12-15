/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        urgent: {
          DEFAULT: '#ff5252',
          light: 'rgba(255, 82, 82, 0.18)',
        },
        business: {
          DEFAULT: '#7728f5',
          light: 'rgba(119, 40, 245, 0.18)',
        },
        attention: {
          DEFAULT: '#000000a6',
          light: '#fffbe6',
          border: '#ffe58f',
        },
        reference: '#004ea2',
        container: {
          light: 'rgba(246, 249, 252, 1)',
        },
      },
    },
  },
  plugins: [],
};
