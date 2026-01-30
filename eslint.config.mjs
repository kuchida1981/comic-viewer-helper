import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["comic-viewer-helper.user.js", "dist/*"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
      }
    }
  },
  {
    files: ["**/*.js"],
    ...pluginJs.configs.recommended,
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    }
  }
];