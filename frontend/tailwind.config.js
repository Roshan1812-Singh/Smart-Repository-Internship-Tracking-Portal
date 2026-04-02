export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e6ecff',
          300: '#a6c7ff',
          400: '#7da8f7',
          DEFAULT: '#5B6FFF',
          600: '#4d58d4',
          700: '#3d4499',
          800: '#2d3366',
          900: '#1a1f3a',
        },
        secondary: {
          light: '#06B6D4',
          DEFAULT: '#0891B2',
          dark: '#0369A1',
        },
        accent: {
          light: '#F59E0B',
          DEFAULT: '#E5A712',
          dark: '#CA8A04',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B6FFF 0%, #0891B2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      },
    },
  },
};
