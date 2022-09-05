import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      "/curl": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        autoRewrite: true,
      },
      "/static": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        autoRewrite: true,
      },
    },
  },
  build: {
    target: "esnext",
  },
});
