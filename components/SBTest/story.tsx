/* eslint-disable */
import React, { Fragment } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { SBTest } from './index'

/* ======================
        default
====================== */

export default {
  title: 'Components/SBTest',
  component: SBTest,
  args: {
    children: ''
  }
  // argTypes: {},
  // parameters: {
  //   componentSubtitle: 'An amazing CartoonFont component!'
  //   // docs: {
  //   //   description: {
  //   //     component: `<div><p>...</p></div>`
  //   //   }
  //   // },
  // }
} as ComponentMeta<typeof SBTest>

/* ======================
        Template
====================== */

const Template: ComponentStory<typeof SBTest> = (args: any) => {
  return <SBTest {...args} />
}

/* ======================
      DefaultExample
====================== */

export const DefaultExample = Template.bind({})
DefaultExample.args = {
  children: (
    <Fragment>
      <h6 className='alert-heading fw-bold'>About:</h6>

      <p>
        This alert mixes in bootstrap classess, which are imported into{' '}
        <code>global.scss</code>. It also uses a <code>SBTest.module.scss</code>{' '}
        in conjunction with an inline <code>style</code> prop. Thus, it
        demonstrates a successful integration of all three approaches.
      </p>

      <p className='mb-0'>
        In order to make this work, this was done in <code>main.js</code>:
      </p>

      <pre>
        <code>{`
  // https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
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
      `}</code>
      </pre>

      <p>
        Additionaly, Storybook was implemente using{' '}
        <code>npx sb init --builder webpack5</code>, which is import for Next.js
        11+.
      </p>
    </Fragment>
  ),
  className: 'alert alert-success border-success border-2 rounded-3',
  style: { boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)', fontSize: 14 }
}

// DefaultExample.parameters = {
//   docs: { storyDescription: `<p>...</p>` }
// }
// DefaultExample.decorators = [
//   (Story) => (<div style={{ minHeight: 200 }}><Story /></div>)
// ]
