module.exports = {
  extends: ['@redhat-cloud-services/eslint-config-redhat-cloud-services', 'plugin:@tanstack/eslint-plugin-query/recommended', 'plugin:storybook/recommended'],
  plugins: ['@tanstack/query'],
  globals: {
    insights: 'readonly',
    shallow: 'readonly',
    render: 'readonly',
    mount: 'readonly',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
    {
      // i18n instrumentation (RHCLOUD-52203 epic): flags user-facing literal strings
      // so they get wrapped with defineMessages before translation.
      // mode 'jsx-only' = JSX text children + JSX attributes (title=, label=,
      // placeholder=, aria-label=, ...). Non-user attributes are excluded below.
      // ERROR — cleared by the wrap in this same PR; from now on new user-facing
      // strings must land wrapped.
      // Remaining blind spot: strings built in JS logic (maps, column defs,
      // notification titles) — covered by the Storybook pseudo-locale pass.
      files: ['src/**/*.tsx', 'src/**/*.ts'],
      excludedFiles: ['**/*.test.*', '**/*.stories.*'],
      plugins: ['i18next'],
      rules: {
        'i18next/no-literal-string': [
          'error',
          {
            mode: 'jsx-only',
            // Replaces the plugin defaults — keep the base list in sync.
            'jsx-attributes': {
              include: [],
              exclude: [
                // plugin defaults
                'className', 'styleName', 'style', 'type', 'key', 'id', 'width', 'height',
                // structural / non-user-facing attributes
                'name', 'href', 'to', 'path', 'target', 'variant', 'component', 'form',
                'fieldId', 'filterId', 'widgetId', 'ouiaId', 'data-testid', 'testId',
                'autoFocus', 'headingLevel', 'size', 'sx', 'direction', 'position',
                'align', 'icon', 'variantPrefix', 'isCompact', 'ouiaId.*',
                // BCP-47 locale tags, not user-facing text
                'locale', 'defaultLocale',
                // ID references and enum-valued attributes
                'aria-describedby', 'titleIconVariant', 'iconVariant',
              ],
            },
          },
        ],
      },
    },
  ],
  rules: {
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
  },
};
