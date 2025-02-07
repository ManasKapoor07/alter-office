export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'build'] }, // Ignore these folders
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'off', // Example: Turn off specific rules
      'no-unused-vars': 'warn', // Change error to warning
    },
  }
);
