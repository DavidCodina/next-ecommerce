import Head from 'next/head'
import { Poppins } from '@next/font/google'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

// https://next-auth.js.org/getting-started/client#sessionprovider
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'

import { AppProvider } from 'contexts'
import { Layout } from '../components'
import 'react-toastify/dist/ReactToastify.css'
// https://stackoverflow.com/questions/66539699/fontawesome-icons-not-working-properly-in-react-next-app
// FontAwesome styles may need to be imported explicitly because
// of something called purgeCSS: "purgeCSS was purging the required FontAwesome styles."
import '@fortawesome/fontawesome-svg-core/styles.css'
// https://blog.logrocket.com/handling-bootstrap-integration-next-js/
// import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.scss'
import type { AppProps } from 'next/app'

const poppins = Poppins({
  subsets: ['latin'],
  // Supposely, with variable fonts, you don't need to explicitly set weights.
  // However, Typescript will complain, so we have to append as any type casting.
  // But then Terminal still complains.
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic']
})

/* ========================================================================
                              App
======================================================================== */

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider
      session={session}
      // https://next-auth.js.org/getting-started/client#refetch-interval
      // The value for refetchInterval should always be lower than the value of the session maxAge session option.
      // refetchInterval={5 * 60} // Re-fetch session every 5 minutes
      //
      // https://next-auth.js.org/getting-started/client#refetch-on-window-focus
      // refetchOnWindowFocus={true} // Re-fetches session when window is focused
    >
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <meta name='description' content='An eCommerce Website' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        ></meta>
        <title>eCommerce Demo</title>

        {/* 
        // You can import remote fonts globally doing this.
        // If you try to do it from within the global css/scss file it won't work.
        // That said, this approach will cause the UI to render with the fallback 
        // font first, then the imported font. This will cause a layout shift.
        // It may not be noticeable to you, but with slow internet speeds, it 
        // will cause a bad effect. The correct approach is to always use font optimization.
        
        <style>
          @import url('https://fonts.googleapis.com/css?family=Luckiest+Guy&display=swap');
        </style> 
        */}
      </Head>

      {/* It's possible to set the font using <div className={poppins.className}>, but
      that wouldn't allow you to have a stack of different fonts. The alternate implementation
      is to use <style jsx global>. */}
      <style jsx global>{`
        body {
          font-family: ${poppins.style.fontFamily}, -apple-system,
            BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol', 'Noto Color Emoji';
        }
      `}</style>

      <AppProvider>
        <Layout>
          <PayPalScriptProvider
            // https://github.com/paypal/react-paypal-js#deferloading
            // Use the optional PayPalScriptProvider deferLoading prop to control when the JS SDK script loads.
            deferLoading={true}
            // Presumably 'client-id': 'test' is okay because we're using deferLoading={true}.
            // Then in  [orderId].tsx we're resetting it with:
            // dispatch({ type: 'resetOptions', value: { 'client-id': clientId, currency: 'USD' } })

            options={{ 'client-id': 'test' }}
          >
            <Component {...pageProps} />
          </PayPalScriptProvider>

          <ToastContainer autoClose={3000} /* limit={1} */ />
        </Layout>
      </AppProvider>
    </SessionProvider>
  )
}
