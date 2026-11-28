import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginUserscripts from "eslint-plugin-userscripts";
import pluginImportX from "eslint-plugin-import-x";

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
      "import-x": pluginImportX,
    },
    settings: {
      "import-x/resolver": {
        "typescript": {
          "alwaysTryTypes": true,
          "project": "./tsconfig.json"
        }
      }
    },
  },
  // JavaScript rules
  {
    files: ["**/*.js", "**/*.mjs"],
    ...pluginJs.configs.recommended,
  },
  // TypeScript rules
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
      "import-x/no-restricted-paths": ["error", {
        "basePath": import.meta.dirname,
        "zones": [
          // logic.ts must not import from any other layers except shared (types.ts, etc.)
          {
            "target": "./src/logic.ts",
            "from": "./src",
            "except": ["./types.ts", "./type-guards.ts", "./i18n.ts", "./shortcuts.ts", "./test/mocks/**/*"],
            "message": "Logic layer must not depend on other layers (pure functions only)."
          },
          // dom.ts can only depend on logic and shared
          {
            "target": "./src/dom.ts",
            "from": "./src",
            "except": ["./logic.ts", "./types.ts", "./type-guards.ts", "./i18n.ts", "./shortcuts.ts", "./test/mocks/**/*"],
            "message": "DOM helper layer can only depend on Logic and Shared layers."
          },
          // store.ts can only depend on logic and shared
          {
            "target": "./src/store.ts",
            "from": "./src",
            "except": ["./logic.ts", "./types.ts", "./type-guards.ts", "./i18n.ts", "./shortcuts.ts", "./test/mocks/**/*"],
            "message": "Store layer can only depend on Logic and Shared layers."
          },
          // adapters can only depend on logic, store and shared
          {
            "target": "./src/adapters",
            "from": "./src",
            "except": ["./logic.ts", "./store.ts", "./types.ts", "./type-guards.ts", "./i18n.ts", "./shortcuts.ts", "./test/mocks/**/*", "./adapters/**/*"],
            "message": "Adapters can only depend on Logic, Store, and Shared layers."
          },
          // UI components can only depend on shared and logic (should be autonomous)
          {
            "target": "./src/ui",
            "from": "./src",
            "except": ["./logic.ts", "./types.ts", "./type-guards.ts", "./ui/utils.ts", "./ui/styles.ts", "./ui/icons.ts", "./i18n.ts", "./shortcuts.ts", "./test/mocks/**/*", "./ui/**/*"],
            "message": "UI components should only depend on Shared/UI Utilities (autonomous components)."
          }
        ]
      }]
    }
  },
  // Enforce pure functions (no browser globals or DOM types) in logic.ts
  {
    files: ["src/logic.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { "name": "window", "message": "src/logic.ts must be DOM-independent (do not reference window)." },
        { "name": "document", "message": "src/logic.ts must be DOM-independent (do not reference document)." },
        { "name": "self", "message": "src/logic.ts must be DOM-independent." },
        { "name": "navigator", "message": "src/logic.ts must be DOM-independent." },
        { "name": "location", "message": "src/logic.ts must be DOM-independent." },
        { "name": "history", "message": "src/logic.ts must be DOM-independent." },
        { "name": "localStorage", "message": "src/logic.ts must be DOM-independent." },
        { "name": "sessionStorage", "message": "src/logic.ts must be DOM-independent." },
        { "name": "HTMLElement", "message": "src/logic.ts must not reference DOM types." },
        { "name": "HTMLImageElement", "message": "src/logic.ts must not reference DOM types." },
        { "name": "Element", "message": "src/logic.ts must not reference DOM types." },
        { "name": "Node", "message": "src/logic.ts must not reference DOM types." },
        { "name": "Document", "message": "src/logic.ts must not reference DOM types." },
        { "name": "Window", "message": "src/logic.ts must not reference DOM types." },
        { "name": "Event", "message": "src/logic.ts must not reference DOM types." },
        { "name": "WheelEvent", "message": "src/logic.ts must not reference DOM types." },
        { "name": "MutationObserver", "message": "src/logic.ts must be DOM-independent." },
        { "name": "IntersectionObserver", "message": "src/logic.ts must be DOM-independent." },
        { "name": "ResizeObserver", "message": "src/logic.ts must be DOM-independent." },
        { "name": "requestAnimationFrame", "message": "src/logic.ts must be DOM-independent." },
        { "name": "cancelAnimationFrame", "message": "src/logic.ts must be DOM-independent." },
        { "name": "getComputedStyle", "message": "src/logic.ts must be DOM-independent." },
        { "name": "alert", "message": "src/logic.ts must be DOM-independent." },
        { "name": "confirm", "message": "src/logic.ts must be DOM-independent." },
        { "name": "prompt", "message": "src/logic.ts must be DOM-independent." }
      ],
      "no-restricted-syntax": [
        "error",
        {
          "selector": "TSTypeReference > Identifier[name=/^(Window|Document|HTMLElement|HTMLImageElement|HTMLAnchorElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|Element|Node|NodeList|Event|WheelEvent|MouseEvent|KeyboardEvent)$/]",
          "message": "src/logic.ts must not reference DOM types (pure functions only)."
        }
      ]
    }
  },
  // Test files: relaxed rules
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
      "import-x/no-restricted-paths": "off"
    }
  }
];
