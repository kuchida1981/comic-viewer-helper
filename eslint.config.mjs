import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginUserscripts from "eslint-plugin-userscripts";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["comic-viewer-helper.user.js", "dist/*", "src/global.d.ts"],
  },
  // Global settings
  {
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
  // JavaScript rules
  {
    files: ["**/*.js", "**/*.mjs"],
    ...pluginJs.configs.recommended,
  },
  // TypeScript rules
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts"],
  })),
  // UserScript rules (specific file)
  {
    files: ["src/header.js", "src/header.ts"],
    plugins: {
      userscripts: pluginUserscripts,
    },
    rules: {
      ...pluginUserscripts.configs.recommended.rules,
      "userscripts/filename-user": "off", // header.js/ts name allowed
    }
  },
  // Custom rules
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-console": "off",
      "@typescript-eslint/ban-ts-comment": "warn", // Warn for @ts-ignore/@ts-nocheck
      "@typescript-eslint/no-explicit-any": "warn"
    }
  },
  // Allow 'any' in test files during migration
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
