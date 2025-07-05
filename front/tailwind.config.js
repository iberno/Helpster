const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Adicione suas extensões de tema personalizadas aqui
      // Por exemplo, cores personalizadas, fontes, etc.
      colors: {
        zinc: {
          700: '#3f3f46', // Definindo a cor zinc-700 para o dark mode
        },
      },
      keyframes: {
        progressBar: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        progressBar: 'progressBar var(--duration) linear forwards',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addUtilities({
        ".transform3d": {
          transform: "perspective(999px) rotateX(0deg) translateZ(0)",
        },
        ".transform3d-hover": {
          transform: "perspective(999px) rotateX(7deg) translate3d(0,-4px,5px)",
        },
        ".transform-dropdown": {
          transform: "perspective(999px) rotateX(-10deg) translateZ(0) translate3d(0,37px,0)",
        },
        ".transform-dropdown-show": {
          transform: "perspective(999px) rotateX(0deg) translateZ(0) translate3d(0,37px,5px)",
        },
        ".flex-wrap-inherit": {
          "flex-wrap": "inherit",
        },
      });
      const typography = {
        a: {
          "letter-spacing": "-0.025rem",
        },

        hr: {
          margin: "1rem 0",
          border: "0",
          opacity: ".25",
        },

        img: {
          maxWidth: "none",
        },

        label: {
          display: "inline-block",
        },

        p: {
          "line-height": "1.625",
          "font-weight": "400",
          "margin-bottom": "1rem",
        },

        small: {
          "font-size": ".875em",
        },

        svg: {
          display: "inline",
        },

        table: {
          "border-collapse": "inherit",
        },

        "h1, h2, h3, h4, h5, h6": {
          "margin-bottom": ".5rem",
          color: "#344767",
        },

        "h1, h2, h3, h4": {
          "letter-spacing": "-0.05rem",
        },

        "h1, h2, h3": {
          "font-weight": "700",
        },
        "h4, h5, h6": {
          "font-weight": "600",
        },

        h1: {
          "font-size": "3rem",
          "line-height": "1.25",
        },
        h2: {
          "font-size": "2.25rem",
          "line-height": "1.3",
        },
        h3: {
          "font-size": "1.875rem",
          "line-height": "1.375",
        },
        h4: {
          "font-size": "1.5rem",
          "line-height": "1.375",
        },
        h5: {
          "font-size": "1.25rem",
          "line-height": "1.375",
        },
        h6: {
          "font-size": "1rem",
          "line-height": "1.625",
        },
      };
      addComponents(typography);
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities({
        "bg-gradient": (angle) => ({
          "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
        }),
      });
    }),
  ],
};
