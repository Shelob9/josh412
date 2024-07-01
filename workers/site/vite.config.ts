

import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import tailwindcss from "tailwindcss";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    }
  },
  plugins: [
    splitVendorChunkPlugin(),
    tsconfigPaths(),
    tailwindcss(),
    react({ include: "**/*.tsx" }),
  ],
  build: {
    assetsDir: "dist",
    manifest: true,
    minify: true,
    ssrManifest: true,
    rollupOptions: {
      input: {
        index: `${__dirname}/index.html`,
        main: resolve(__dirname, "src/entry-client.tsx"),
        globals: resolve(__dirname, "src/globals.css"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
        globals: {
          react: "React",
        },
      },
    },
  },
});
