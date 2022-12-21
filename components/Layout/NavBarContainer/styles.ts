import styled from 'styled-components'

export const SCNavBarContainer = styled.header`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: transform 0.15s linear;
  z-index: 1030; /* Same as Bootstrap's .fixed-top */

  &.ms-hide-nav {
    transform: translateY(-100%);
  }

  &.ms-scrollbar-transition-none {
    transition: none !important;
  }
`
