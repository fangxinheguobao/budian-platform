/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: {
          50: '#FBF9F4',
          100: '#F6F2E9',
          200: '#EDE7D8',
          300: '#DED4BC',
        },
        cotton: '#FDFCF8',
        indigo: {
          50: '#EEF2F7',
          100: '#D8E1EC',
          200: '#B0C2D8',
          300: '#7E99BC',
          400: '#5B7AA3',
          500: '#43628C',
          600: '#33507A',
          700: '#2A4265',
          800: '#233652',
          900: '#1C2B41',
        },
        clay: {
          50: '#FAF0E8',
          100: '#F2DCCB',
          200: '#E4B99B',
          300: '#D39670',
          400: '#C0754D',
          500: '#A65E3A',
          600: '#8A4B2E',
        },
        ink: {
          900: '#22262D',
          700: '#3A404B',
          600: '#4A5260',
          500: '#5C6472',
          400: '#7B8494',
          300: '#9AA3B2',
        },
      },
      fontFamily: {
        display: ['Georgia', '"Times New Roman"', 'STSong', 'STZhongsong', 'SimSun', 'serif'],
        body: ['"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(34,38,45,.04), 0 8px 24px -12px rgba(34,38,45,.12)',
        lift: '0 2px 4px rgba(34,38,45,.05), 0 16px 40px -16px rgba(34,38,45,.22)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}
