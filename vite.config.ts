import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ["gsap"],
          three: ["three"],
        },
      },
    },
  },
});
