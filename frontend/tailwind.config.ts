import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        "50": "12.5rem", // 200px for skill node width
        "30": "7.5rem", // 120px for min height
        "35": "8.75rem", // 140px for goal min height
      },
      borderWidth: {
        "12": "12px",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          from: {
            boxShadow: "0 0 20px rgba(255, 107, 53, 0.4)",
          },
          to: {
            boxShadow:
              "0 0 35px rgba(255, 107, 53, 0.7), 0 0 50px rgba(255, 107, 53, 0.3)",
          },
        },
      },
      dropShadow: {
        "green-glow": "0 0 10px rgba(0, 255, 136, 0.8)",
        "yellow-glow": "0 0 10px rgba(255, 215, 0, 0.8)",
        "orange-glow": "0 0 15px rgba(255, 109, 0, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
