import { SCCartoonFont } from './styles'
import { Luckiest_Guy } from '@next/font/google'
import { ICartoonFont } from './types'

////////////////////////////////////////////////////////////////////////////////
//
// Gotcha: This will break the storybook implementation.
// Upgrading to Storybook v7 will not necessarily fix the issue:
// https://github.com/storybookjs/storybook/issues/19711
// Using Next 13's new @next/font font loader, which is required for loading
// fonts in the new /app routes directory, breaks storybook v7 if it is referenced.
// Not sure if something can be done to shim it here or if it needs to be fixed upstream.
//
// This is a very recent issue and is still being worked on.
//
////////////////////////////////////////////////////////////////////////////////

const luckiestGuy = Luckiest_Guy({
  weight: '400',
  subsets: ['latin'],
  style: ['normal']
})

/* =============================================================================
                              CartoonFont
============================================================================= */

export const CartoonFont = ({
  as = 'h1',
  borderColor = '#409',
  children,
  className = '',
  color = '#fff',
  style = {}
}: ICartoonFont) => {
  /* ======================
          return
  ====================== */

  return (
    <SCCartoonFont
      as={as}
      borderColor={borderColor}
      className={`${className}${luckiestGuy && ` ${luckiestGuy.className}`}`}
      color={color}
      style={style}
    >
      {children}
    </SCCartoonFont>
  )
}
