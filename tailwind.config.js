/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0b63f3',
        text: '#111111',
        muted: '#666666',
        border: '#eeeeee',
        background: '#ffffff'
      },
      borderRadius: {
        'md': '12px',
        'lg': '16px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries')
  ]
};
