// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { GetServerSideProps } from 'next'

// Third-party imports
import React, { Fragment, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

// Custom imports
import { useAppContext } from 'contexts'
import { CartoonFont } from 'components'
import styles from './PaymentInfoPage.module.scss'

/* ========================================================================
                             PaymentInfoPage
======================================================================== */

const PaymentInfoPage = () => {
  const router = useRouter()

  const { paymentInfo, setPaymentInfo } = useAppContext()

  const [fullName, setFullName] = useState(paymentInfo?.fullName || '')
  const [address, setAddress] = useState(paymentInfo?.address || '')
  const [city, setCity] = useState(paymentInfo?.city || '')
  const [state, setState] = useState(paymentInfo?.state || '')
  const [postalCode, setPostalCode] = useState(paymentInfo?.postalCode || '')
  const [country, setCountry] = useState(paymentInfo?.country || '')

  const [paymentMethod, setPaymentMethod] = useState(
    paymentInfo?.paymentMethod || ''
  )

  /* ======================
        handleSubmit()
  ====================== */

  const handleSubmit = () => {
    if (
      fullName.trim() === '' ||
      address.trim() === '' ||
      city.trim() === '' ||
      state.trim() === '' ||
      postalCode.trim() === '' ||
      country.trim() === '' ||
      paymentMethod.trim() === ''
    ) {
      toast.error('Please complete all fields prior to submitting!')
      return
    }

    setPaymentInfo({
      fullName,
      address,
      city,
      state,
      postalCode,
      country,
      paymentMethod
    })

    toast.success('Payment information submitted!')
    router.push('/place-order')
  }

  /* ======================
  renderPaymentInfoForm()
  ====================== */

  const renderPaymentInfoForm = () => {
    return (
      <form
        className='p-3 mx-auto  rounded-3'
        style={{
          backgroundColor: '#fafafa',
          border: '1px solid var(--bs-primary)'
        }}
      >
        <section className='d-lg-flex' style={{ gap: 15 }}>
          <div className='mb-3 flex-fill'>
            <label className='form-label' htmlFor='fullName'>
              Full Name <sup className='text-danger'>*</sup>
            </label>

            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='fullName'
              onChange={(e) => {
                setFullName(e.target.value)
              }}
              value={fullName}
            />
          </div>

          <div className='mb-3 flex-fill'>
            <label className='form-label' htmlFor='address'>
              Address <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='address'
              onChange={(e) => {
                setAddress(e.target.value)
              }}
              value={address}
            />
          </div>
        </section>

        <section className='d-lg-flex' style={{ gap: 15 }}>
          <div className='mb-3 flex-fill'>
            <label htmlFor='city'>
              City <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='city'
              onChange={(e) => {
                setCity(e.target.value)
              }}
              value={city}
            />
          </div>

          <div className='mb-3 flex-fill'>
            <label htmlFor='city'>
              State <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='state'
              onChange={(e) => {
                setState(e.target.value)
              }}
              value={state}
            />
          </div>

          <div className='mb-3 flex-fill'>
            <label className='form-label' htmlFor='postalCode'>
              Postal Code <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='postalCode'
              onChange={(e) => {
                setPostalCode(e.target.value)
              }}
              value={postalCode}
            />
          </div>

          <div className='mb-3 flex-fill'>
            <label htmlFor='country'>
              Country <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='country'
              onChange={(e) => {
                setCountry(e.target.value)
              }}
              value={country}
            />
          </div>
        </section>

        <div className='mb-3'>
          <label className='form-label'>
            Payment Method <sup className='text-danger'>*</sup>
          </label>
          {['PayPal' /* , 'Stripe', 'CashOnDelivery' */].map((method) => {
            return (
              <div key={method} className='form-check'>
                <input
                  checked={paymentMethod === method}
                  className='form-check-input'
                  id={method}
                  name='paymentMethod'
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  type='radio'
                  value={method}
                />

                <label
                  className='form-check-label'
                  style={{ fontWeight: 'normal' }}
                  htmlFor={method}
                >
                  {method}
                </label>
              </div>
            )
          })}

          <div className='form-text'>Currently, we only support PayPal...</div>
        </div>

        <button
          onClick={handleSubmit}
          className='btn btn-secondary btn-sm fw-bold d-block w-100'
          type='button'
        >
          Submit
        </button>
      </form>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Payment Info</title>
        <meta name='description' content='Payment Info' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <CartoonFont
          style={{
            margin: '25px auto',
            textAlign: 'center'
          }}
        >
          Payment Info
        </CartoonFont>

        {renderPaymentInfoForm()}
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
  ) // => session | null

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false // Always set permanent:false to indicate that it's only this time that we want to redirect.
      }
    }
  }

  // If authenticated, then continue with normal flow...
  return {
    props: {}
  }
}

export default PaymentInfoPage
