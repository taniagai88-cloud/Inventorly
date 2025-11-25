import { type Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FAF9F6", // soft warm white
          dark: "#1E1F21", // charcoal slate
        },
        primary: {
          DEFAULT: "#A6BBA9", // sage green
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6BA8A9", // muted teal
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E07A5F", // terracotta
          foreground: "#FFFFFF",
        },
        text: {
          primary: "#333333",
          secondary: "#7C7C7C",
        },
        success: "#4CAF50",
        warning: "#F4A261",
        error: "#D77A61",
      },
    },
  },
  plugins: [],
}

export default config

