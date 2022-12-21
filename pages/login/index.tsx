import React, { Fragment } from 'react'
import Head from 'next/head'

// https://next-auth.js.org/configuration/nextjs#unstable_getserversession
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

// https://nextjs.org/docs/basic-features/typescript
import { /* GetStaticProps, GetStaticPaths, */ GetServerSideProps } from 'next'

import { CartoonFont } from 'components'
import { LoginForm } from 'components/login'
import styles from './LoginPage.module.scss'

/* =============================================================================
                                  PageLogin
============================================================================= */

const PageLogin = () => {
  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Login</title>
        <meta name='description' content='Login' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont
          style={{
            margin: '25px auto',
            textAlign: 'center'
          }}
        >
          Login
        </CartoonFont>

        <LoginForm style={{ marginBottom: 15 }} />
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

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

export default PageLogin
