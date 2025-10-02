// eslint.config.mjs
import eslint from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import prettierPlugin from "eslint-plugin-prettier"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import globals from "globals"
import ts from "typescript"

export default [
  { ignores: ["dist", "node_modules", "**/*.config.*", "jest.config.js"] },

  eslint.configs.recommended,

  {
    files: ["src/*.ts"],

    languageOptions: {
      parser: tsparser,
      sourceType: "module",
      parserOptions: { project: ["./tsconfig.json"] },
      globals: globals.node,
    },

    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["flat/strict-type-checked"].rules,
      ...tseslint.configs["flat/stylistic-type-checked"].rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off",
      "prettier/prettier": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  eslintConfigPrettier,
]
