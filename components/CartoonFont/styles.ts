import styled from 'styled-components'
// https://codepen.io/kylewetton/pen/yLBwdJX?editors=1100

interface ISCCartoonFont {
  color: string
  borderColor: string
}

export const SCCartoonFont = styled.h1<ISCCartoonFont>`
  --alpha: 0.5;
  --border-color: ${({ borderColor }) => borderColor};
  color: ${({ color }) => color};
  font-size: 50px;
  letter-spacing: 3px;
  line-height: 1;
  margin: 0;
  padding: 0;
  text-shadow: 0.05em -0.03em 0 var(--border-color),
    0.05em 0.005em 0 var(--border-color), 0em 0.08em 0 var(--border-color),
    0.05em 0.08em 0 var(--border-color), 0px -0.03em 0 var(--border-color),
    -0.03em -0.03em 0 var(--border-color), -0.03em 0.08em 0 var(--border-color),
    -0.03em 0 0 var(--border-color), 0 0.1em 10px rgba(0, 0, 0, var(--alpha));
`
