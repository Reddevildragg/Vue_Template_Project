export default {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-tailwindcss',
    ],
    plugins: ['stylelint-order'],
    rules: {
      "block-no-empty": null,
      "no-empty-source": null
    },
    ignoreFiles: ['dist/**/*', 'node_modules/**/*'],
}
