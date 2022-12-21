// This entire file is added based on the following instructions for adding styled components
// https://styled-components.com/docs/advanced#nextjs

import Document, { DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

// Must be class-based in order to extend Document
export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()]
      }
    } finally {
      sheet.seal()
    }
  }
}
