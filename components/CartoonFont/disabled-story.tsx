import React from 'react'
// Use these types instead of: import { Story, Meta } from '@storybook/react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { CartoonFont } from './index'

////////////////////////////////////////////////////////////////////////////////
//
// Gotcha: CartoonFont uses '@next/font/google', which currently is not compatible
// with Storybook. It will break the storybook implementation.
//
// Upgrading to Storybook v7 will not necessarily fix the issue:
// https://github.com/storybookjs/storybook/issues/19711
// Using Next 13's new @next/font font loader, which is required for loading
// fonts in the new /app routes directory, breaks storybook v7 if it is referenced.
// Not sure if something can be done to shim it here or if it needs to be fixed upstream.
//
// This is a very recent issue and is still being worked on.
//
////////////////////////////////////////////////////////////////////////////////

/* ======================
        default
====================== */
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

export default {
  title: 'Components/CartoonFont',
  component: CartoonFont,
  args: {
    children: 'Title Goes Here...'
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
} as ComponentMeta<typeof CartoonFont>
// I used to type cast this as Meta - import { Meta, Story } from '@storybook/react'
// But the above type casting is what's done in new examples.

/* ======================
        Template
====================== */
// Here, I used to use: const Template: Story<CartoonFont> = (args: any) => { ... }
// However, the new default examples do this instead:

const Template: ComponentStory<typeof CartoonFont> = (args: any) => {
  return <CartoonFont {...args} />
}

/* ======================
      DefaultExample
====================== */

export const DefaultExample = Template.bind({})
DefaultExample.args = {}

// DefaultExample.parameters = {
//   docs: { storyDescription: `<p>...</p>` }
// }
// DefaultExample.decorators = [
//   (Story) => (<div style={{ minHeight: 200 }}><Story /></div>)
// ]
