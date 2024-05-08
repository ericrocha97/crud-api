import eslintParser from '@typescript-eslint/parser'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.js'],
        rules: {
            camelcase: 'off',
        },
        languageOptions: {
            parser: eslintParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
            },
        },
    },
    eslintPluginPrettier
)
