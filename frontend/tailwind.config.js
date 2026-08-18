/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        easy: "#22c55e",
        medium: "#f59e0b",
        hard: "#ef4444",
      },
    },
  },
  plugins: [],
};
