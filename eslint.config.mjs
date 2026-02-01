import globals from "globals";
import pluginJs from "@eslint/js";
import pluginUserscripts from "eslint-plugin-userscripts";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["comic-viewer-helper.user.js", "dist/*", "src/global.d.ts"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
        __APP_VERSION__: "readonly",
        __IS_UNSTABLE__: "readonly",
      }
    }
  },
  {
    // UserScript 固有のルールは header.js に適用
    files: ["src/header.js"],
    plugins: {
      userscripts: pluginUserscripts,
    },
    rules: {
      ...pluginUserscripts.configs.recommended.rules,
      "userscripts/filename-user": "off", // header.js という名前を許容
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