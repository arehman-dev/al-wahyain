/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', 'serif'],
        indopak: ['"Gulzar"', '"Noto Naskh Arabic"', 'serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', '"Gulzar"', 'serif'],
        ibm: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      colors: {
        tajweed: {
          madd: '#e11d48',
          ghunnah: '#16a34a',
          ikhfa: '#059669',
          qalqalah: '#0284c7',
          silent: '#94a3b8',
          iqlab: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
