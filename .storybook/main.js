const path = require('path') // eslint-disable-line

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../**/*.stories.@(js|jsx|ts|tsx)', // Added this
    '../**/story.@(js|jsx|ts|tsx)' // Added this
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/react',

  // This is added automatically when using npx sb init --builder webpack5
  // See this document if you are migrating an older version of Storybook
  // https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#webpack-5
  core: {
    builder: '@storybook/builder-webpack5'
  },

  // https://storybook.js.org/docs/react/builders/webpack
  // When configuring sass, DO NOT use the use a plugin/preset.
  // They are almost all super old. Instead just do this.
  webpackFinal: async (config /*, { configType } */) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../')
    })
    return config
  }
}
