/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F5C4A',
          light: '#4A8B7A',
          dark: '#143D31'
        },
        secondary: {
          DEFAULT: '#2C5F8A',
          light: '#5A8BB5',
          dark: '#1A3D5C'
        },
        accent: {
          DEFAULT: '#C0392B',
          light: '#E74C3C',
          dark: '#922B21'
        },
        municipal: {
          red: '#C0392B',
          yellow: '#F1C40F',
          green: '#1F5C4A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
}
