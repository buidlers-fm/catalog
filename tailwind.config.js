/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "450px",
      sm: "640px",
      md: "768px",
      ml: "896px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    colors: {
      transparent: "transparent",
      white: "hsl(45, 4%, 92%)",
      black: "hsl(45, 4%, 12%)",
      gold: {
        100: "hsl(45, 100%, 86%)",
        200: "hsl(45, 100%, 79%)",
        300: "hsl(45, 100%, 69%)",
        500: "hsl(45, 100%, 55%)",
        700: "hsl(45, 86%, 38%)",
        800: "hsl(45, 86%, 30%)",
        900: "hsl(45, 86%, 23%)",
      },
      teal: {
        100: "hsl(181, 43%, 81%)",
        200: "hsl(181, 43%, 72%)",
        300: "hsl(181, 43%, 60%)",
        500: "hsl(181, 64%, 40%)",
        700: "hsl(181, 64%, 28%)",
        800: "hsl(181, 64%, 22%)",
        900: "hsl(181, 64%, 17%)",
      },
      red: {
        100: "hsl(5, 100%, 86%)",
        200: "hsl(5, 100%, 80%)",
        300: "hsl(5, 100%, 71%)",
        500: "hsl(5, 100%, 56%)",
        700: "hsl(5, 78%, 40%)",
        800: "hsl(5, 78%, 31%)",
        900: "hsl(5, 78%, 24%)",
      },
      green: {
        100: "hsl(74, 60%, 85%)",
        200: "hsl(74, 60%, 77%)",
        300: "hsl(74, 60%, 66%)",
        500: "hsl(74, 60%, 50%)",
        700: "hsl(74, 60%, 35%)",
        800: "hsl(74, 60%, 27%)",
        900: "hsl(74, 60%, 21%)",
      },
      gray: {
        100: "hsl(45, 8%, 85%)",
        200: "hsl(45, 8%, 78%)",
        300: "hsl(45, 8%, 68%)",
        500: "hsl(45, 8%, 52%)",
        700: "hsl(45, 8%, 37%)",
        800: "hsl(45, 8%, 29%)",
        900: "hsl(45, 8%, 22%)",
      },
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        "chivo-mono": ["var(--font-chivo-mono)"],
        newsreader: ["var(--font-newsreader)"],
        mulish: ["var(--font-mulish)"],
      },
      boxShadow: {
        black: `2px 2px 0px 0px hsl(0, 0, 0)`,
      },
    },
  },
  plugins: [],
}
