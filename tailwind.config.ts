import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'board-bg': '#bf8a52',
        'paper': '#f7f2e8',
        'dark-brown': '#1c0f07',
        'accent': '#c4956a',
        'sticky-yellow': '#feff9c',
        'sticky-blue': '#7afcff',
        'sticky-pink': '#ff7eb9',
        'sticky-green': '#7fffd4',
        'sticky-purple': '#d1a3ff',
        'sticky-orange': '#ffc371',
      },
      fontFamily: {
        caveat: ['var(--font-caveat)', 'cursive'],
      },
      backgroundImage: {
        'cork-texture': "url('/cork-texture.png')", // We won't use an actual image to avoid generic UI, but we can use css patterns if we want, or just stick to the color. We'll stick to the solid #bf8a52 for now and use some CSS shadow/noise if needed.
      }
    },
  },
  plugins: [],
};
export default config;
