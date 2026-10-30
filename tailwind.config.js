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
        app: ['"Montserrat"', 'system-ui', 'sans-serif'],
        ibm: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        indopak: ['"Al Qalam Quran Publisher"', '"Jameel Noori Nastaleeq"', '"Noto Nastaliq Urdu"', 'serif'],
        uthmani: ['"KFGQPC Uthman Taha Naskh"', '"KFGQPC Uthmanic Script HAFS"', '"Amiri Quran"', 'serif'],
        arabic: ['"KFGQPC Uthman Taha Naskh"', '"Amiri Quran"', '"Scheherazade New"', 'serif'],
        urdu: ['"Jameel Noori Nastaleeq"', '"Noto Nastaliq Urdu"', 'serif'],
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
