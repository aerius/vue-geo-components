import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library mode: emit ESM only, with peer dependencies kept external so they
// are not bundled and resolve to the consuming app's copy at runtime.
// https://vite.dev/guide/build#library-mode
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      include: ["src"],
      exclude: ["src/**/__tests__/**", "src/**/*.test.ts"],
      // Emit declarations flat under dist/ (dist/index.d.ts), not dist/src/.
      // Per-file .d.ts resolve correctly for our bundler-resolution consumers
      // (GRIP/Archive). A node16/nodenext consumer would need rollupTypes: true
      // (which pulls in @microsoft/api-extractor); revisit only if that happens.
      entryRoot: "src",
    }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    // Ship readable code with sourcemaps; the consuming apps minify again, and
    // a minified library only makes their stack traces unreadable.
    sourcemap: true,
    minify: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // Peer dependencies must never be bundled. `ol` ships many entry points
      // (ol/Map, ol/View, ...) so match the whole namespace.
      external: ["vue", "pinia", "proj4", "ol", /^ol\//],
    },
  },
});
