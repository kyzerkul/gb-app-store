/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        krapk: {
          primary: '#66BB6A',    // Vert clair primaire
          secondary: '#388E3C',  // Vert foncé secondaire
          accent: '#FF6F00',     // Orange accent
          background: '#FAFAFA', // Fond très clair
          text: '#212121',       // Texte principal
          'info-bg': '#E8F5E9',  // Fond info
          'info-text': '#388E3C',// Texte info
          social: {
            facebook: '#3b5998',
            linkedin: '#0077B5',
            email: '#D44638'
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
