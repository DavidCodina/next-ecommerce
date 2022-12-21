// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import connectDB from 'utils/db'
import Order from 'models/orderModel'
import Product from 'models/productModel'
import User from 'models/userModel'

// Third-party imports
import { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Bar } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons' // https://github.com/FortAwesome/react-fontawesome

// Custom imports
import { CartoonFont } from 'components'
import styles from './AdminDashboardPage.module.scss'

/* ======================
  Chart Configuration
====================== */

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
}

/* ========================================================================
                          AdminDashboardPage
======================================================================== */

const AdminDashboardPage = ({
  ordersCount,
  productsCount,
  usersCount,
  ordersPrice,
  salesData
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  /* ======================
      renderContent()
  ====================== */

  const renderContent = () => {
    if (
      typeof ordersCount !== 'number' ||
      typeof ordersPrice !== 'number' ||
      typeof productsCount !== 'number' ||
      typeof usersCount !== 'number' ||
      !Array.isArray(salesData)
    ) {
      return (
        <div className='alert alert-danger border-danger rounded-3 shadow-sm'>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            style={{ marginRight: 5 }}
          />{' '}
          Unable to get summary data
        </div>
      )
    }

    // Data Derived from props
    // This data is passed to the react-chartjs-2 Bar chart.
    // I would prefer to pass it inline, and also have a check
    // around <Bar /> itself to make sure that the necessary data
    // is available. That, said, rendercontent() has the necessary checks.
    // already.
    const data = {
      labels: salesData.map((x: any) => x._id), // 2022/01 2022/03
      datasets: [
        {
          label: 'Sales',
          backgroundColor: 'rgba(0, 181, 226, 0.5)',
          data: salesData.map((x: any) => x.totalSales)
        }
      ]
    }

    return (
      <Fragment>
        <section className='row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 mb-3'>
          <div className='col'>
            <div className='card border-primary'>
              <div className='card-body p-2 d-flex flex-column align-items-center'>
                <h5 className='fw-bold text-primary'>Sales: ${ordersPrice}</h5>
                <button
                  className='btn btn-secondary btn-sm fw-bold'
                  onClick={() => router.push('/admin/orders')}
                  style={{ minWidth: 150 }}
                >
                  View Sales
                </button>
              </div>
            </div>
          </div>

          <div className='col'>
            <div className='card border-primary'>
              <div className='card-body p-2 d-flex flex-column align-items-center'>
                <h5 className='fw-bold text-primary'>Orders: {ordersCount}</h5>

                <button
                  className='btn btn-secondary btn-sm fw-bold'
                  onClick={() => router.push('/admin/orders')}
                  style={{ minWidth: 150 }}
                >
                  View Orders
                </button>
              </div>
            </div>
          </div>

          <div className='col'>
            <div className='card border-primary'>
              <div className='card-body p-2 d-flex flex-column align-items-center'>
                <h5 className='fw-bold text-primary'>
                  Products: {productsCount}
                </h5>

                <button
                  className='btn btn-secondary btn-sm fw-bold'
                  onClick={() => router.push('/admin/products')}
                  style={{ minWidth: 150 }}
                >
                  View Products
                </button>
              </div>
            </div>
          </div>

          <div className='col'>
            <div className='card border-primary'>
              <div className='card-body p-2 d-flex flex-column align-items-center'>
                <h5 className='fw-bold text-primary'>Users: {usersCount}</h5>

                <button
                  className='btn btn-secondary btn-sm fw-bold'
                  onClick={() => router.push('/admin/users')}
                  style={{ minWidth: 150 }}
                >
                  View Users
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className='card border-primary'>
            <div className='card-body'>
              <h5 className='fw-bold text-primary'>Sales Report:</h5>

              <Bar
                options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: 'right' as const
                    }
                  }
                }}
                data={data}
              />
            </div>
          </div>
        </section>
      </Fragment>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Dashboard</title>
        <meta name='description' content='Admin Dashboard' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Admin Dashboard
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

        {renderContent()}
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
        permanent: false // Always set permanent:false to indicate that it's only this time that we want to redirect.
      }
    }
  }

  // The logic here is similar to that of /api/admin/summary
  try {
    await connectDB()

    // countDocuments() is a built-in Mongoose method.
    const ordersCount = await Order.countDocuments()
    const productsCount = await Product.countDocuments()
    const usersCount = await User.countDocuments()

    // aggregate() is a built-in Mongoose method.
    // This occurs in Basir Udemy tutorial video 29 at 14:30.
    const ordersPriceGroup = await Order.aggregate([
      {
        $group: {
          _id: null,
          sales: { $sum: '$totalPrice' }
        }
      }
    ])

    const ordersPrice =
      ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0

    // This occurs in Basir Udemy tutorial video 29 at 15:45.
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$totalPrice' }
        }
      }
    ])

    return {
      props: { ordersCount, productsCount, usersCount, ordersPrice, salesData }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }

    return {
      props: {
        ordersCount: null,
        productsCount: null,
        usersCount: null,
        ordersPrice: null,
        salesData: null
      }
    }
  }
}

export default AdminDashboardPage
