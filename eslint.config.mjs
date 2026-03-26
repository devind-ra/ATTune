import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { sonarjs },
    rules: {
      ...sonarjs.configs.recommended.rules,
      complexity: ["error", 10],
      "sonarjs/cognitive-complexity": ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-lines-per-function": ["warn", 60],
      "max-lines": ["warn", 300],
      "sonarjs/no-identical-functions": "error",
      "no-nested-ternary": "error",
      "sonarjs/no-duplicate-string": "warn",
      "spaced-comment": ["error", "always"],
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}", "**/__tests__/**/*"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
