import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // The demo imports the compose client from ../src — allow serving it.
    fs: { allow: [".."] },
  },
});
