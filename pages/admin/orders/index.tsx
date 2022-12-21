// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import connectDB from 'utils/db'
import Order from 'models/orderModel'

// Third-party imports
import { Fragment } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

// Custom imports
import { CartoonFont } from 'components'
import { formatDate } from 'utils'
import styles from './AdminOrdersPage.module.scss'

/* ========================================================================
                                AdminOrdersPage
======================================================================== */

const AdminOrdersPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ orders }) => {
  const router = useRouter()

  /* ======================
    renderOrdersTable()
  ====================== */

  const renderOrdersTable = () => {
    // If the are no orders, then we will still get back an empty array from the database.
    //# We may want to make this better, or also differentiate between no orders, and null orders
    //# which would imply an error.
    if (!orders || (Array.isArray(orders) && orders.length === 0)) {
      return (
        <div className='alert alert-info border-info rounded-3'>
          Whoops! There are no orders!
        </div>
      )
    }

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
              <th className='py-2 text-primary'>id</th>
              <th className='py-2 text-primary' style={{ minWidth: 200 }}>
                User
              </th>
              <th className='py-2 text-primary'>Date</th>
              <th className='py-2 text-primary'>Total</th>
              <th className='py-2 text-primary'>Paid</th>
              <th className='py-2 text-primary'>Delivered</th>
              <th className='py-2 text-primary' style={{ minWidth: 100 }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: any) => {
              return (
                <tr key={order._id}>
                  <td className='text-center'>{order._id.substring(20, 24)}</td>

                  <td className='text-center'>
                    {order?.user?.name ? order?.user?.name : 'DELETED USER'}
                  </td>

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
              )
            })}
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
        <title>Admin Orders</title>
        <meta name='description' content='Admin Orders' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Admin Orders
        </CartoonFont>

        {/* The <section> implements a scrollable container around the btn-group. */}
        <section style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className='btn-group mx-auto mb-5 hide-scrollbar'
            style={{
              display: 'flex',
              overflowX: 'scroll',
              borderRadius: 0
            }}
          >
            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/dashboard')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Dashboard
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/orders')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Orders
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/products')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Products
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/users')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Users
            </button>
          </div>
        </section>

        {renderOrdersTable()}
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session: any = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  ) // => session | null

  // Return early if user is unauthenticated
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false // Always set permanent:false to indicate that it's only this time that we want to redirect.
      }
    }
  }

  // Return early if user does not have sufficient privileges/roles
  // If there is a session, but the user does not have the correct
  // authorization (not admin), then redirect them to the 403 page.
  if (!session?.user?.roles.includes('admin')) {
    return {
      redirect: {
        destination: '/403',
        permanent: false
      }
    }
  }

  // If authorized, then get data from database.
  try {
    await connectDB()

    let orders = await Order.find().populate('user', 'name')

    if (orders) {
      orders = JSON.parse(JSON.stringify(orders))
    }

    return {
      props: {
        orders: orders
      }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }

    return {
      props: {
        orders: null
      }
    }
  }
}

export default AdminOrdersPage
