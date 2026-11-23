// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default createConfigForNuxt({
  features: {
    // Prettier owns formatting.
    stylistic: false,
    tooling: true,
  },
})
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  })
  .append(
    {
      name: 'prettier/config',
      plugins: { prettier: prettierPlugin },
      rules: {
        ...prettierConfig.rules,
        'prettier/prettier': 'error',
      },
    },
    {
      name: 'calcura/ignores',
      ignores: [
        '**/.nuxt/**',
        '**/.output/**',
        '**/.data/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/coverage/**',
        '**/public/sw.js',
        '**/public/workbox-*.js',
        '**/public/registerSW.js',
        '**/public/manifest.webmanifest',
        '**/dev-dist/**',
      ],
    },
  )
