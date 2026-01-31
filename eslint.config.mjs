import globals from "globals";
import pluginJs from "@eslint/js";
import pluginUserscripts from "eslint-plugin-userscripts";

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
    // UserScript 固有のルールは main.js (エントリポイント) にのみ適用
    files: ["src/main.js"],
    plugins: {
      userscripts: pluginUserscripts,
    },
    rules: {
      ...pluginUserscripts.configs.recommended.rules,
      "userscripts/filename-user": "off", // main.js という名前を許容
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