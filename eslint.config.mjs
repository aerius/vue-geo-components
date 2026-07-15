import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormattingConfig from "@vue/eslint-config-prettier/skip-formatting";
import vueParser from "vue-eslint-parser";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-ignore",
    ignores: [".gitignore", "dist/**", "node_modules/**", ".vscode", "**/*.json"],
  },

  js.configs.recommended,

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  skipFormattingConfig,
  ...pluginVue.configs["flat/recommended"],
  ...pluginVue.configs["flat/strongly-recommended"],

  {
    files: ["vue", "js", "mjs", "ts"].flatMap((ext) => [`*.${ext}`, `**/*.${ext}`]),
    rules: {
      eqeqeq: "error",
      curly: "error",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-debugger": "warn",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/singleline-html-element-content-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-indent": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "any",
            normal: "never",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "no-undef": "off",
    },
  },

  {
    files: ["*.vue", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
      },
    },
  },
);
