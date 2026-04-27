import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: false,
                },
            ],
            "@typescript-eslint/no-var-requires": "warn",
            "comma-dangle": ["error", "always-multiline"],
        },
    },
    {
        files: ["scripts/*.mjs"],
        languageOptions: {
            globals: {
                console: "readonly",
            },
        },
    },
    includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
);
