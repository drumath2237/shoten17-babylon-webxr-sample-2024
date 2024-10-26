import { defineConfig } from "vite";
import ssl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      plugins: [ssl()],
    };
  }

  return {};
});
