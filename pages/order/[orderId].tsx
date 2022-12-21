// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

// Third-party imports
import { Fragment, useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTriangleExclamation,
  faCircleCheck,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios' //! Temporary

// Custom imports
import { getOrder as apiGetOrder, updateOrderAsDelivered } from 'client-api'
import { CartoonFont } from 'components'
import styles from './OrderPage.module.scss'

/* ========================================================================
                            OrderPage
======================================================================== */

const OrderPage = ({
  payPalKey
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // https://github.com/nextauthjs/next-auth/issues/671
  // https://github.com/nextauthjs/next-auth/discussions/2979
  const { data: session }: any = useSession()
  const isAdmin = session?.user?.roles?.includes('admin')

  const [{ isPending }, dispatch] = usePayPalScriptReducer()
  const router = useRouter()
  const { orderId } = router.query
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [loadingPay, setLoadingPay] = useState(false)
  const [loadingDeliver, setLoadingDeliver] = useState(false)

  /* ======================
        getOrder()
  ====================== */

  const getOrder = useCallback(() => {
    setLoading(true)

    apiGetOrder(orderId as string)
      .then((res: any) => {
        if (res.success === true && res.data) {
          setOrder(res.data)
        }
      })
      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
        }

        if (err.message) {
          toast.error(err.message || 'Could not get order!')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId])

  /* ======================
        createOrder()
  ====================== */
  // Used by PayPalButtons
  // https://github.com/paypal/react-paypal-js#paypalbuttons
  // It may not matter but the createOrder() example in the docs
  // has value as a string:  amount: { value: "1.99" }, while
  // ours is a number.

  const createOrder = (_data: any, actions: any) => {
    const { totalPrice } = order

    return actions.order
      .create({
        purchase_units: [{ amount: { value: totalPrice } }]
      })
      .then((orderID: any) => {
        return orderID
      })
  }

  /* ======================
        onApprove()
  ====================== */
  // Used by PayPalButtons

  const onApprove = (_data: any, actions: any) => {
    if (!order || !order._id) {
      return
    }

    return actions.order.capture().then(async (details: any) => {
      try {
        // When the payment has bee approved, use the details object
        // to update the associated order document.
        setLoadingPay(true)

        // The order document would have been created in the _ page.
        // Here we use a different endpoint that is used specifically for
        // updating: order.isPaid, order.paidAt, and order.paymentResult
        await axios.put(`/api/orders/${order._id}/pay`, details)

        // On success of the associated order document update, do this:
        setLoadingPay(false)
        toast.success('Order is paid successfully')
        getOrder()
      } catch (err) {
        // On fail of updating the associated order document, do this:
        setLoadingPay(false)
        toast.error('Something went wrong updating the order in the database.')
      }
    })
  }

  /* ======================
        onError()
  ====================== */
  // Used by PayPalButtons

  const onError = (_err: any) => {
    toast.error('An error occurred with the PayPal payment!')
  }

  /* ======================
  handleUpdateOrderAsDelivered()
  ====================== */

  const handleUpdateOrderAsDelivered = async () => {
    if (!order || !order._id) {
      return
    }

    setLoadingDeliver(true)

    updateOrderAsDelivered(order._id)
      .then((_res: any) => {
        toast.success('The order has been marked as delivered.')
        getOrder()
      })
      .catch((_err: any) => {
        toast.error('Unable to update the order delivery status!')
      })
      .finally(() => {
        setLoadingDeliver(false)
      })
  }

  /* ======================
       useEffect()
  ====================== */

  useEffect(() => {
    if (payPalKey) {
      dispatch({
        type: 'resetOptions',
        value: { 'client-id': payPalKey, currency: 'USD' }
      })
      dispatch({ type: 'setLoadingStatus', value: 'pending' } as any)
    }
  }, [dispatch, payPalKey])

  /* ======================
        useEffect()
  ====================== */
  // Call getOrder() on page mount.

  useEffect(() => {
    if (!order || (typeof order === 'object' && !order?._id)) {
      getOrder()
    }
  }, [getOrder, order, orderId])

  /* ======================
      renderOrderInfo()
  ====================== */

  const renderOrderInfo = () => {
    //# This needs to be improved.
    if (loading) {
      return <h3 className='text-center text-secondary fw-bold'>Loading...</h3>
    }

    if (!order) {
      return (
        <div className='alert alert-danger border border-danger shadow-sm'>
          Could not get order!
        </div>
      )
    }

    // Once we know there is an order, then it's safe to destructure the order state.
    const {
      shippingAddress,
      paymentMethod,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      isDelivered,
      deliveredAt
    } = order

    return (
      <Fragment>
        <section
          className='d-flex flex-column flex-lg-row'
          style={{ gap: 15, marginBottom: 15 }}
        >
          {/* =====================
            Shipping Address Card
          ===================== */}

          <div className='card border-primary' style={{ flex: 1 }}>
            <div className='card-body'>
              <h6 className='text-secondary fw-bold'>Shipping Address:</h6>

              <div style={{ fontSize: 14 }}>
                {shippingAddress?.fullName}, {shippingAddress?.address},{' '}
                {shippingAddress?.city}, {shippingAddress?.postalCode},{' '}
                {shippingAddress?.country}
              </div>

              {isDelivered ? (
                <div className='alert alert-success mt-3 mb-0 border-success shadow-sm'>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ marginRight: 5 }}
                  />
                  Delivered on{' '}
                  {new Date(deliveredAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              ) : (
                <div className='alert alert-danger mt-3 mb-0 border-danger shadow-sm'>
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    style={{ marginRight: 5 }}
                  />{' '}
                  The order has not been delivered yet!
                </div>
              )}
            </div>
          </div>

          {/* =====================
             Payment Method Card
          ===================== */}

          <div className='card border-primary' style={{ flex: 1 }}>
            <div className='card-body'>
              <h6 className='text-secondary fw-bold'>Payment Method:</h6>

              <div>{paymentMethod}</div>

              {isPaid ? (
                <div className='alert alert-success mt-3 mb-0 border-success shadow-sm'>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ marginRight: 5 }}
                  />{' '}
                  Paid on{' '}
                  {new Date(paidAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              ) : (
                <div className='alert alert-danger mt-3 mb-0 border-danger shadow-sm'>
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    style={{ marginRight: 5 }}
                  />{' '}
                  The order has not been paid yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================
           Order Items Table
        ===================== */}

        <div
          className='table-responsive rounded-3 mx-auto shadow-sm'
          style={{ border: '1px solid var(--bs-primary)', marginBottom: 15 }}
        >
          <table
            className='table table-striped table-hover table-flush table-bordered table-sm bg-white align-middle'
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
              {orderItems.map((item: any) => (
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
          </table>
        </div>

        {/* =====================
            Order Summary Card
        ===================== */}

        <div className='card border-primary' style={{ marginBottom: 15 }}>
          <div className='card-body'>
            <h6 className='text-secondary fw-bold'>Order Summary:</h6>

            <ul
              className='list-group list-group-flush'
              style={{ fontSize: 14 }}
            >
              <li className='list-group-item d-flex justify-content-between'>
                <span className='text-primary fw-bold'>Items:</span>
                <span className='text-success'>${itemsPrice}</span>
              </li>

              <li className='list-group-item d-flex justify-content-between'>
                <span className='text-primary fw-bold'>Tax:</span>
                <span className='text-success'>${taxPrice}</span>
              </li>
              <li className='list-group-item d-flex justify-content-between'>
                <span className='text-primary fw-bold'>Shipping:</span>
                <span className='text-success'>${shippingPrice}</span>
              </li>

              <li className='list-group-item d-flex justify-content-between'>
                <span className='text-primary fw-bold'>Total:</span>
                <span className='text-success'>${totalPrice}</span>
              </li>

              {!isPaid && (
                <li className='list-group-item p-0'>
                  {isPending ? (
                    <div>Loading...</div>
                  ) : (
                    <Fragment>
                      <div className='alert alert-info mt-3 mb-3 border-info shadow-sm'>
                        <p className='mb-2'>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            style={{ marginRight: 5 }}
                          />{' '}
                          This demo currently uses a PayPal Sandbox. The
                          checkout user credentials for this are:
                        </p>

                        <div className='d-flex justify-content-center'>
                          <ul style={{ listStyleType: 'disc' }}>
                            <li>
                              <strong>Email:</strong>{' '}
                              sb-iepe4723449581@personal.example.com
                            </li>

                            <li>
                              <strong>Password: </strong> 12345678
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div
                        style={{
                          marginBottom: -25,
                          paddingTop: 15,
                          textAlign: 'center'
                        }}
                      >
                        {/* https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default */}
                        <PayPalButtons
                          style={{ height: 30, shape: 'pill' }}
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>

                      {loadingPay && <div>Loading...</div>}
                    </Fragment>
                  )}
                </li>
              )}
            </ul>

            {isAdmin && isPaid && !isDelivered && (
              <Fragment>
                {loadingDeliver ? (
                  <button
                    className='d-block w-100 btn btn-secondary btn-sm fw-bold'
                    disabled
                  >
                    <span
                      aria-hidden='true'
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                    ></span>
                    Updating Order As Delivered...
                  </button>
                ) : (
                  <button
                    className='d-block w-100 btn btn-secondary btn-sm fw-bold'
                    onClick={handleUpdateOrderAsDelivered}
                  >
                    Update Order As Delivered
                  </button>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </Fragment>
    )
  }

  /* ======================
           return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Order Details</title>
        <meta name='description' content='Order Details' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          {`Order ${orderId}`}
        </CartoonFont>

        {renderOrderInfo()}
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

  return {
    props: {
      payPalKey: process.env.PAYPAL_CLIENT_ID
    }
  }
}

export default OrderPage
