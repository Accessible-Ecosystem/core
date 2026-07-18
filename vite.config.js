/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    hmr: {
      host: "localhost",
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          environmentOptions: {
            pretendToBeVisual: true,
          },
          include: ["tests/**/*.unit.{test,spec}.{js,ts,jsx,tsx}"],
        },
      },
    ],
  },
});
