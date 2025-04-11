import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#d2f348",
          foreground: "#000000",
        },
        fern_green: {
          DEFAULT: "#677a3e",
          100: "#15180c",
          200: "#293119",
          300: "#3e4925",
          400: "#526231",
          500: "#677a3e",
          600: "#8ba653",
          700: "#a9bd7d",
          800: "#c6d3a8",
          900: "#e2e9d4",
        },
        black_olive: {
          DEFAULT: "#37352f",
          100: "#0b0b09",
          200: "#161513",
          300: "#21201c",
          400: "#2c2a26",
          500: "#37352f",
          600: "#635f54",
          700: "#8e897b",
          800: "#b4b1a7",
          900: "#d9d8d3",
        },
        eggshell: {
          DEFAULT: "#f0e9d7",
          100: "#423619",
          200: "#846c32",
          300: "#be9f53",
          400: "#d7c495",
          500: "#f0e9d7",
          600: "#f3edde",
          700: "#f6f1e7",
          800: "#f9f6ef",
          900: "#fcfaf7",
        },
        pear: {
          DEFAULT: "#d2f348",
          100: "#303b04",
          200: "#617708",
          300: "#91b20b",
          400: "#c1ee0f",
          500: "#d2f348",
          600: "#daf66d",
          700: "#e4f892",
          800: "#edfab6",
          900: "#f6fddb",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
