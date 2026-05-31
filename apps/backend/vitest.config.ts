import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
  plugins: [
    swc.vite({
      jsc: {
        target: "es2022",
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
