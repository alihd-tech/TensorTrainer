/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8accff',
          400: '#52b1ff',
          500: '#2990ff',
          600: '#1a71f2',
          700: '#1659e1',
          800: '#1847b5',
          900: '#193f8f',
        },
        secondary: {
          50: '#f4f7fb',
          100: '#e9eff7',
          200: '#cedeed',
          300: '#a4c3dd',
          400: '#74a2c9',
          500: '#5285b5',
          600: '#406a98',
          700: '#35547a',
          800: '#2f4765',
          900: '#2b3d55',
        }
      },
    },
  },
  plugins: [],
}