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
        sans: ['"IBM Plex Sans Arabic"', '"Montserrat"', 'sans-serif'],
        mono: ['"Montserrat"', '"IBM Plex Sans Arabic"', 'monospace'],
        app: ['"Montserrat"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        ibm: ['"IBM Plex Sans Arabic"', '"Montserrat"', 'sans-serif'],
        qcf: ['"KFGQPC HAFS Uthmanic Script"', '"QCF V2"', '"QPC V2"', '"IBM Plex Sans Arabic"', 'serif'],
        indopak: ['"KFGQPC HAFS Uthmanic Script"', '"QCF V2"', '"QPC V2"', '"IBM Plex Sans Arabic"', 'serif'],
        uthmani: ['"KFGQPC HAFS Uthmanic Script"', '"QCF V2"', '"QPC V2"', '"IBM Plex Sans Arabic"', 'serif'],
        arabic: ['"KFGQPC HAFS Uthmanic Script"', '"QCF V2"', '"QPC V2"', '"IBM Plex Sans Arabic"', 'serif'],
        urdu: ['"IBM Plex Sans Arabic"', '"Montserrat"', 'sans-serif'],
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
