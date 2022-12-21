// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { GetServerSideProps } from 'next'

// Third-party imports
import { Fragment, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { toast } from 'react-toastify'

// Custom imports
import { getOrderHistory } from 'client-api'
import { formatDate } from 'utils'
import { CartoonFont } from 'components'
import styles from './OrderHistoryPage.module.scss'

/* ========================================================================
                              OrderHistoryPage
======================================================================== */

const OrderHistoryPage = () => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any>(null)

  /* ======================
        useEffect()
  ====================== */
  //# This should instead be done with getServerSideProps()

  useEffect(() => {
    setLoading(true)

    getOrderHistory()
      .then((res: any) => {
        if (res.success === true && Array.isArray(res.data)) {
          setOrders(res.data)
        }
      })
      .catch((err: any) => {
        console.log(err)
        toast.error('Could not get order history!')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  /* ======================
      renderContent()
  ====================== */

  const renderContent = () => {
    // if (error) {
    //   return (
    //     <div className='text-center fw-bold text-secondary'>Loading...</div>
    //   )
    // }

    if (loading) {
      //# Temporary until an actual spinner is implemented.
      return <h3 className='text-center fw-bold text-secondary'>Loading...</h3>
    }

    if (!orders || (Array.isArray(orders) && orders.length === 0)) {
      return (
        <div className='alert alert-secondary border-secondary text-center'>
          <strong>Whoops!</strong> Could not find any orders.
        </div>
      )
    }

    return (
      <div
        className='table-responsive rounded-3 mx-auto shadow-sm'
        style={{ border: '1px solid var(--bs-primary)', marginBottom: 25 }}
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
              <th className='py-2 text-primary'>id</th>
              <th className='py-2 text-primary'>Date</th>
              <th className='py-2 text-primary'>Total</th>
              <th className='py-2 text-primary'>Paid</th>
              <th className='py-2 text-primary'>Delivered</th>
              <th className='py-2 text-primary' style={{ width: 100 }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id}>
                <td className='text-center'>{order._id.substring(20, 24)}</td>

                {/* Or format it */}
                <td className='text-center'>{formatDate(order.createdAt)}</td>
                <td className='text-center text-success'>
                  ${order.totalPrice}
                </td>
                <td className='text-center'>
                  {order.isPaid ? formatDate(order.paidAt) : 'Not Paid'}
                </td>
                <td className='text-center'>
                  {order.isDelivered
                    ? formatDate(order.deliveredAt)
                    : 'Not Delivered'}
                </td>
                <td className='text-center'>
                  <Link
                    href={`/order/${order._id}`}
                    style={{
                      color: 'var(--bs-secondary)',
                      textDecoration: 'none'
                    }}
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Order History</title>
        <meta name='description' content='Order History' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Order History
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
        permanent: false
      }
    }
  }

  // If authenticated, then continue with normal flow...
  return {
    props: {}
  }
}

export default OrderHistoryPage
