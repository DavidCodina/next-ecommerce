// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'

// Third-party imports
import { Fragment, useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { toast } from 'react-toastify'

// Custom imports
import { getAdminProducts as apiGetAdminProducts } from 'client-api'
import { CartoonFont } from 'components'
import styles from './AdminProductsPage.module.scss'

/* ========================================================================
                          AdminProductsPage
======================================================================== */

const AdminProductsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter()
  const [products, setProducts] = useState<any>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [deletingProduct, setDeletingProduct] = useState(false)
  const [creatingProduct, setCreatingProduct] = useState(false)

  /* ======================
      getAdminProducts()  
  ====================== */
  // Called on mount, after deleting a product, and after creating a product.

  const getAdminProducts = useCallback(() => {
    setLoadingProducts(true)

    apiGetAdminProducts()
      .then((res: any) => {
        if (res.success === true && res.data) setProducts(res.data)
      })
      .catch((_err: any) => {
        toast.error('Unable to get products.')
      })
      .finally(() => {
        setLoadingProducts(false)
      })
  }, [])

  /* ======================
    handleCreateProduct()
  ====================== */

  const handleCreateProduct = async () => {
    if (!window.confirm('Are you sure?')) {
      return
    }

    setCreatingProduct(true)

    axios
      .post(`/api/admin/products/`)
      .then((res: any) => {
        toast.success('Product created successfully')
        // After a product is created, redirect to the new product's page.
        const productId = res?.data?.data?._id?.toString()

        router.push(`/admin/product/${productId}`)
        // getAdminProducts()
      })

      .catch((_err: any) => {
        toast.error('Unable to create product')
      })

      .finally(() => {
        setCreatingProduct(false)
      })
  }

  /* ======================
    handleDeleteProduct()
  ====================== */

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure?')) {
      return
    }

    setDeletingProduct(true)

    axios
      .delete(`/api/admin/products/${productId}`)
      .then((_res: any) => {
        toast.success('Product deleted successfully!')
        // After a product is deleted, reload products.
        getAdminProducts()
      })

      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
          toast.error(err.message)
        } else {
          toast.error('Unable to delete product!')
        }
      })

      .finally(() => {
        setDeletingProduct(false)
      })
  }

  /* ======================
        useEffect()
  ====================== */

  useEffect(() => {
    getAdminProducts()
  }, [getAdminProducts])

  /* ======================
    renderProductsTable()
  ====================== */

  const renderProductsTable = () => {
    //# We may want to make this better...
    if (loadingProducts) {
      return <h3 className='text-center fw-bold text-secondary'>Loading...</h3>
    }

    // If the are no products, then we will still get back an empty array from the database.
    //# We may want to make this better, or also differentiate between no products,
    //# and null products which would imply an error.
    if (!products || (Array.isArray(products) && products.length === 0)) {
      return (
        <div className='alert alert-info border-info rounded-3'>
          Whoops! There are no products!
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
              <th className='py-2 text-primary'>Name</th>
              <th className='py-2 text-primary'>Price</th>
              <th className='py-2 text-primary'>Category</th>
              <th className='py-2 text-primary'>Count</th>
              <th className='py-2 text-primary'>Rating</th>
              <th className='py-2 text-primary' style={{ width: 180 }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td className='text-center'>{product._id.substring(20, 24)}</td>
                <td className='text-center'>{product.name}</td>
                <td className='text-center text-success'>${product.price}</td>
                <td className='text-center'>{product.category}</td>
                <td className='text-center'>{product.countInStock}</td>
                <td className='text-center'>{product.rating}</td>

                <td className='text-center'>
                  <div className='btn-group'>
                    <button
                      className='btn btn-outline-secondary btn-sm fw-bold bg-white-unimportant'
                      onClick={() =>
                        router.push(`/admin/product/${product._id}`)
                      }
                      style={{ minWidth: 75 }}
                    >
                      Edit
                    </button>

                    {deletingProduct ? (
                      <button
                        className='btn btn-outline-danger btn-sm fw-bold'
                        disabled
                        style={{
                          backgroundColor: '#fff',
                          minWidth: 75,
                          opacity: 1
                        }}
                      >
                        <span
                          className='spinner-border spinner-border-sm'
                          role='status'
                          aria-hidden='true'
                        ></span>
                      </button>
                    ) : (
                      <button
                        className='btn btn-outline-danger btn-sm fw-bold bg-white-unimportant'
                        onClick={() => handleDeleteProduct(product._id)}
                        style={{ minWidth: 75 }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
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
        <title>Admin Products</title>
        <meta name='description' content='Admin Products' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Admin Products
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

        {creatingProduct ? (
          <button
            disabled
            className='d-block mx-auto mb-3 btn btn-secondary btn-sm fw-bold'
          >
            <span
              className='spinner-border spinner-border-sm me-2'
              role='status'
              aria-hidden='true'
            ></span>
            Creating Product...
          </button>
        ) : (
          <button
            onClick={handleCreateProduct}
            className='d-block mx-auto mb-3 btn btn-secondary btn-sm fw-bold'
          >
            Create Product
          </button>
        )}

        {renderProductsTable()}
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
        permanent: false
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

  return {
    props: {}
  }
}

export default AdminProductsPage
