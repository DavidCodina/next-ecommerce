// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { GetServerSideProps } from 'next'

// Third-party imports
import { Fragment, useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'

// Custom imports
import { useAppContext } from 'contexts'
import { placeOrder } from 'client-api'
import { CartoonFont } from 'components'
import styles from './PlaceOrderPage.module.scss'

/* ========================================================================
                            PlaceOrderPage
======================================================================== */

const PlaceOrderPage = () => {
  const { cartItems, paymentInfo, resetCartItems } = useAppContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const missingPaymentInfo =
    !paymentInfo.fullName ||
    !paymentInfo.address ||
    !paymentInfo.city ||
    !paymentInfo.state ||
    !paymentInfo.postalCode ||
    !paymentInfo.country ||
    !paymentInfo.paymentMethod

  // This function rounds a number to a maximum of two decimial places.
  const round2 = (n: number) => Math.round(n * 100 + Number.EPSILON) / 100

  // This takes the quantity of each cartItem, multiplies it by its price,
  // and sums each result. Then that value is rounded to a maximum of two
  // decimal places.
  const itemsPrice = round2(
    cartItems.reduce((accumulator: number, value: Record<string, any>) => {
      return accumulator + value.quantity * value.price
    }, 0)
  )

  // Here we made up a rule such that if the itemPrice is greater than $200
  // then we say shipping is free. Otherwise, it's $15.
  const shippingPrice = itemsPrice > 200 ? 0 : 15

  // Here we made up a rule that tax is 0.15 of the itemsPrice.
  const taxPrice = round2(itemsPrice * 0.15)

  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  /* ======================
      handlePlaceOrder()
  ====================== */

  const handlePlaceOrder = async () => {
    try {
      setLoading(true)

      const shippingAddress = { ...paymentInfo }
      delete shippingAddress.paymentMethod

      const requestData = {
        itemsPrice,
        orderItems: cartItems,
        paymentMethod: paymentInfo.paymentMethod,
        shippingAddress: shippingAddress,
        shippingPrice,
        taxPrice,
        totalPrice
      }

      const res = await placeOrder(requestData)
      setLoading(false)

      router.push(`/order/${res?.data?._id}`).then(() => {
        // Rather than resetting the entire order info with resetOrderInfo(),
        // instead clear out only the cartItems, thereby leaving paymentInfo
        // intact for the potential of anothe order.
        resetCartItems()
      })
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(err.message)
      }

      setLoading(false)
      toast.error('Whoops! Something went wrong with placing the order!')
    }
  }

  /* ======================
        useEffect()
  ====================== */

  useEffect(() => {
    if (missingPaymentInfo) {
      toast.warn('Please complete payment info prior to placing order.')
      router.push('/payment-info')
    }
  }, [missingPaymentInfo, router])

  /* ======================
     renderPaymentInfo()
  ====================== */

  const renderPaymentInfo = () => {
    if (missingPaymentInfo) {
      return (
        <div className='alert alert-danger border border-danger rounded-3 d-flex justify-content-between align-items-center'>
          Missing Payment Information!
          <button
            className='btn btn-danger btn-sm fw-bold'
            onClick={() => router.push('/payment-info')}
            style={{ minWidth: 250 }}
          >
            Complete Payment Information
          </button>
        </div>
      )
    }

    return (
      <div className='card border-primary' style={{ marginBottom: 15 }}>
        <div className='card-body'>
          <section style={{ marginBottom: 15 }}>
            <h6 className='fw-bold text-secondary'>Shipping Address:</h6>
            <div style={{ fontSize: 14 }}>
              {paymentInfo?.fullName}, {paymentInfo?.address},{' '}
              {paymentInfo?.city}, {paymentInfo?.postalCode},{' '}
              {paymentInfo?.country}
            </div>
          </section>

          <section>
            <h6 className='fw-bold text-secondary'>Payment Method:</h6>
            <div style={{ fontSize: 14 }}>{paymentInfo.paymentMethod}</div>
          </section>

          <button
            className='btn btn-secondary btn-sm fw-bold d-block mx-auto'
            onClick={() => router.push('/payment-info')}
            style={{ minWidth: 250 }}
          >
            Edit Payment Information
          </button>
        </div>
      </div>
    )
  }

  /* ======================
    renderItemSummary()
  ====================== */

  const renderItemSummary = () => {
    return (
      <div
        className='table-responsive rounded-3 mx-auto shadow-sm border border-primary'
        style={{ marginBottom: 25 }}
      >
        <table
          className='table table-striped table-hover table-bordered table-flush table-sm bg-white align-middle'
          style={{
            fontSize: 14,
            margin: 0
          }}
        >
          <thead
            className='text-center'
            style={{
              borderBottom: '2px solid #ccc'
            }}
          >
            <tr>
              <th className='py-2 text-primary'>Item</th>
              <th className='py-2 text-primary'>Quantity</th>
              <th className='py-2 text-primary'>Price</th>
              <th className='py-2 text-primary'>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {cartItems.map((item: any) => (
              <tr key={item._id}>
                <td>
                  <Link
                    href={`/product/${item._id}`}
                    style={{
                      color: 'var(--bs-secondary)',
                      textDecoration: 'none'
                    }}
                  >
                    <img
                      alt={item.name}
                      src={item.image}
                      style={{
                        border: '1px solid #ccc',
                        borderRadius: 5,

                        height: 50,
                        marginRight: 5
                      }}
                    />
                    {item.name}
                  </Link>
                </td>
                <td className='text-center'>{item.quantity}</td>
                <td className='text-center text-success'>${item.price}</td>
                <td className='text-center text-success'>
                  ${item.quantity * item.price}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot
            style={{
              borderTop: '2px solid #ccc'
            }}
          >
            <tr>
              <td colSpan={4} className='p-3'>
                <button
                  className='btn btn-secondary btn-sm fw-bold d-block mx-auto'
                  onClick={() => router.push('/cart')}
                  style={{ minWidth: 250 }}
                >
                  Edit Cart
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  /* ======================
    renderOrderSummary()
  ====================== */

  const renderOrderSummary = () => {
    return (
      <div className='card border-primary'>
        <div className='card-body'>
          <h6 className='fw-bold text-secondary'>Order Summary:</h6>

          <ul className='list-group list-group-flush' style={{ fontSize: 14 }}>
            <li className='list-group-item d-flex justify-content-between'>
              <span className='text-primary fw-bold'>Items:</span>{' '}
              <span className='text-success'>${itemsPrice}</span>
            </li>
            <li className='list-group-item d-flex justify-content-between'>
              <span className='text-primary fw-bold'>Tax:</span>{' '}
              <span className='text-success'>${taxPrice}</span>
            </li>
            <li className='list-group-item d-flex justify-content-between'>
              <span className='text-primary fw-bold'>Shipping:</span>{' '}
              <span className='text-success'>${shippingPrice}</span>
            </li>
            <li className='list-group-item d-flex justify-content-between'>
              <span className='text-primary fw-bold'>Total:</span>{' '}
              <span className='text-success'>${totalPrice}</span>
            </li>
          </ul>

          {loading ? (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block mx-auto'
              disabled
              style={{ minWidth: 250 }}
            >
              <span
                className='spinner-border spinner-border-sm me-2'
                role='status'
                aria-hidden='true'
              ></span>
              Placing Order
            </button>
          ) : (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block mx-auto'
              disabled={missingPaymentInfo}
              onClick={handlePlaceOrder}
              style={{ minWidth: 250 }}
            >
              Place Order
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ======================
     renderContent()
  ====================== */

  const renderContent = () => {
    if (!Array.isArray(cartItems) || cartItems?.length === 0) {
      return (
        <div className='alert alert-secondary border-secondary d-flex justify-content-between align-items-center shadow-sm'>
          <p className='m-0'>
            <strong>Whoops!</strong> Your cart is empty.
          </p>
          <button
            className='btn btn-secondary btn-sm fw-bold'
            onClick={() => router.push('/')}
          >
            View Products
          </button>
        </div>
      )
    }

    return (
      <Fragment>
        {renderPaymentInfo()}
        {renderItemSummary()}
        {renderOrderSummary()}
      </Fragment>
    )
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Place Order</title>
        <meta name='description' content='Place Order Page' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Place Order
        </CartoonFont>

        {renderContent()}
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

// This does not seem to affect the ability to implement getServerSideProps()
export default dynamic(() => Promise.resolve(PlaceOrderPage), { ssr: false })
