import daisyui from 'daisyui';
import tailwindcssTypography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      padding: {
        '22px': '22px',
        '25px': '25px',
      },
    },
  },
  daisyui: {
    themes: [
      'light',
      'dark',
      'dim',
      'nord',
      'coffee',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'tomorrow',
      'pokemon',
      'wireframe',
    ],
  },
  plugins: [tailwindcssTypography, daisyui],
};
