import React, { Fragment } from 'react'
import Head from 'next/head'

// https://next-auth.js.org/configuration/nextjs#unstable_getserversession
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

// https://nextjs.org/docs/basic-features/typescript
import { /* GetStaticProps, GetStaticPaths, */ GetServerSideProps } from 'next'

import { CartoonFont } from 'components'
import { RegisterForm } from 'components/register' // local components
import styles from './RegisterPage.module.scss'

/* =============================================================================
                                  PageRegister
============================================================================= */

const PageRegister = () => {
  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Register</title>
        <meta name='description' content='Register' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont
          style={{
            margin: '25px auto',
            textAlign: 'center'
          }}
        >
          Register
        </CartoonFont>

        <RegisterForm />
      </main>
    </Fragment>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  // In this case, we want to redirect away from the '/register' page if they're already authenticated.
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}

export default PageRegister
