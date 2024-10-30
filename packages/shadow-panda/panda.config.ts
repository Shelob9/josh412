import { defineConfig } from "@pandacss/dev";

export default defineConfig({
    // presets: ['@shadow-panda/preset'],
    jsxFramework: "react",
    // Whether to use css reset
    preflight: true,

    // Where to look for your css declarations
    include: ["./src/**/*.{js,jsx,ts,tsx}",
        './dist/panda.buildinfo.json',
    ],

    // Files to exclude
    exclude: [],

    // Useful for theme customization
    theme: {
        extend: {},
    },

    // The output directory for your css system
    // outdir: "styled-system",
    outdir: "@shadow-panda/styled-system",
    importMap: '@josh412/shadow-panda',
});
