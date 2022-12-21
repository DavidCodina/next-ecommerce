import styles from './SBTest.module.scss'

/* =============================================================================
                                SBTest
============================================================================= */
////////////////////////////////////////////////////////////////////////////////
//
// This is a simple test component to test Storybook integration.
// Initially, I added storybook using: npx sb init --builder webpack5.
// Somehow I screwed it up, and it didn't actually install the necessary dependencies.
// I think I did npx storybook --builder webpack5. That may have been a mistake.
// So definitely do this: npx sb init --builder webpack5
// https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#webpack-5
// Will add the following to package.json
//
// "devDependencies": {
//   "@babel/core": "^7.20.5",
//   "@storybook/addon-actions": "^6.5.14",
//   "@storybook/addon-essentials": "^6.5.14",
//   "@storybook/addon-interactions": "^6.5.14",
//   "@storybook/addon-links": "^6.5.14",
//   "@storybook/builder-webpack5": "^6.5.14",
//   "@storybook/manager-webpack5": "^6.5.14",
//   "@storybook/react": "^6.5.14",
//   "@storybook/testing-library": "^0.0.13",
//   "babel-loader": "^8.3.0"
// }
//
// This looks like it might be helpful: https://www.makeuseof.com/storybook-nextjs-set-up/
// But actually, the implementation in that example didn't quite work for me.
// Instead, I just did what the storybook docs show:
// https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
//
// By default, Storybook does not come with out-of-the-box support for the Sass extension language.
// You need to extend the webpack configuration by installing style-loader, css-loader, and sass-loader.
//
//   npm i -D style-loader css-loader sass-loader
//
//# The https://www.makeuseof.com/storybook-nextjs-set-up/
//# link may provide useful info for handling <Image />.
//# This video also has advice on de-optimizing <Image />
//# https://www.youtube.com/watch?v=i5tvZ9f7gJw
//# That said, the Storybook v7 actually has support
//# for <Image />. Technically, the new @storybook/nextjs package,
//# which has NOT been implemented in this project:
//# https://storybook.js.org/blog/integrate-nextjs-and-storybook-automatically/
//
////////////////////////////////////////////////////////////////////////////////

export const SBTest = ({
  children = 'children...',
  className,
  style = {}
}: any) => {
  /* ======================
          return
  ====================== */

  return (
    <div
      className={`${styles.test}${className && ` ${className}`}`}
      style={style}
    >
      {children}
    </div>
  )
}
