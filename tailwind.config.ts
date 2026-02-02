import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        efc: {
          lime: "#D3E500",
          "lime-dark": "#b8c900",
          "gray-dark": "#2d3748",
          "gray-darker": "#1a202c",
          executive: "#1e3a5f",
          "executive-light": "#2d4a6f",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
