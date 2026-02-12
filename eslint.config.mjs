import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginUserscripts from "eslint-plugin-userscripts";
import pluginBoundaries from "eslint-plugin-boundaries";

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
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      boundaries: pluginBoundaries,
    },
    settings: {
      "boundaries/elements": [
        {
          "type": "shared",
          "pattern": ["src/types.ts", "src/type-guards.ts", "src/ui/utils.ts", "src/ui/styles.ts"]
        },
        {
          "type": "logic",
          "pattern": ["src/logic.ts"]
        },
        {
          "type": "store",
          "pattern": ["src/store.ts"]
        },
        {
          "type": "adapters",
          "pattern": ["src/adapters/**/*"]
        },
        {
          "type": "ui",
          "pattern": ["src/ui/**/*", "!src/ui/utils.ts", "!src/ui/styles.ts"],
          "mode": "full"
        },
        {
          "type": "managers",
          "pattern": ["src/managers/**/*"]
        },
        {
          "type": "entry",
          "pattern": ["src/main.ts", "src/header.ts"]
        }
      ]
    }
  },
  // JavaScript rules
  {
    files: ["**/*.js", "**/*.mjs"],
    ...pluginJs.configs.recommended,
  },
  // TypeScript rules: Start with strictTypeChecked but suppress unsafe rules for Phase 1
  ...tseslint.configs.strictTypeChecked.map(config => ({
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
    files: ["**/*.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-console": "off",
      "complexity": ["error", 10],
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "eqeqeq": ["error", "always", { "null": "ignore" }],

      // Phase 3: Strict rules are now enabled.
      "@typescript-eslint/unbound-method": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { "ignoreArrowShorthand": true }],
      "@typescript-eslint/no-unnecessary-condition": "error",

      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/require-await": "off"
    }
  },
  // Layered architecture dependency enforcement
  {
    files: ["src/**/*.ts"],
    rules: {
      "boundaries/element-types": ["error", {
        "default": "disallow",
        "message": "${from.type} is not allowed to import ${to.type}",
        "rules": [
          {
            "from": "entry",
            "allow": ["managers", "ui", "adapters", "store", "logic", "shared"]
          },
          {
            "from": "managers",
            "allow": ["ui", "adapters", "store", "logic", "shared"]
          },
          {
            "from": "ui",
            "allow": ["shared"]
          },
          {
            "from": "adapters",
            "allow": ["store", "logic", "shared"]
          },
          {
            "from": "store",
            "allow": ["logic", "shared"]
          },
          {
            "from": "logic",
            "allow": ["shared"]
          },
          {
            "from": "shared",
            "allow": ["shared"]
          }
        ]
      }]
    }
  },
  // Specific suppressions for files with persistent overlap/safety issues
  {
    files: ["src/logic.ts", "src/ui/utils.ts", "src/adapters/DefaultAdapter.ts", "src/managers/Navigator.ts"],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off"
    }
  },
  // Test files: relaxed rules for mocks and DOM manipulations.
  // Note: Unsafe rules are disabled here because Vitest mock APIs (mock.calls, etc.) 
  // return 'any' values that are difficult to type-safely handle without excessive casting.
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "boundaries/element-types": "off"
    }
  }
];