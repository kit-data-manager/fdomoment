const config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{ts,tsx}",
	"./node_modules/flowbite-react/**/*.js"
  ],
    plugins: [
      require('@tailwindcss/forms'),
      require("tailwindcss-animate"),
  ]
}

export default config;
