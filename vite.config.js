import shopify from "vite-plugin-shopify";
import globs from "rollup-plugin-globlin";
import cleanup from "@by-association-only/vite-plugin-shopify-clean";

export default {
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    emptyOutDir: false,
    outDir: "assets", // Ensure files go directly into the assets folder
    rollupOptions: {
      output: {
        entryFileNames: "[name].js", // Avoid subfolders
        assetFileNames: "[name].[ext]", // Avoid subfolders for CSS, images, etc.
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  plugins: [
    cleanup(),
    shopify({ versionNumbers: true }),
    globs.default({
      globs: ["frontend/web/**/sections/*.liquid"],
      dest: "sections",
      clean: false,
    }),
    globs.default({
      globs: ["frontend/web/**/snippets/*.liquid"],
      dest: "snippets",
      clean: false,
    }),
  ],
};