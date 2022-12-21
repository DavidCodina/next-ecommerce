// Third-party imports
import React, { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { useAppContext } from 'contexts'
import { getProduct } from 'client-api'
import { CartoonFont } from 'components'
import styles from './CartPage.module.scss'

/* ========================================================================
                                CartPage
======================================================================== */

const CartPage = () => {
  const router = useRouter()
  const { addCartItem, cartItems, removeCartItem } = useAppContext()

  /* ======================
      removeItemHandler()
  ====================== */

  const handleRemoveItem = (item: any) => {
    removeCartItem(item._id)
  }

  /* ======================
      handleUpdateCart()
  ====================== */

  const handleUpdateCart = async (
    item: Record<string, any>,
    quantityString: string
  ) => {
    const quantity = Number(quantityString)

    try {
      // Get product data from database in order affirm existence & check fresh countInStock.
      const { data: product } = await getProduct(item._id)

      // This could potentially occur if the user requested the page, but then didn't
      // interact with it until days/weeks later. Because an unknown amount of time
      // wil have elapsed, it's always good to check here.
      if (!product) {
        toast.error('Sorry. The product may be unavailable at this time.')
        return
      }

      if (product.countInStock < quantity) {
        toast.error("Sorry. We don't have that quantity of this product.")
        return
      }

      const cartItem = { ...item, quantity }
      addCartItem(cartItem)
      toast.success('The quantity has been updated!')
    } catch (err) {
      // Presumably, this would only occur if the API call made from within
      // getProduct() went to the catch block, resulting in a rejected Promise.
      toast.error('Unable to update the item quantity at this time.')
    }
  }

  /* ======================
      renderTable()
  ====================== */

  const renderTable = () => {
    if (Array.isArray(cartItems) && cartItems.length === 0) {
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
              <th className='py-2 text-primary'>Item</th>
              <th className='py-2 text-primary'>Quantity</th>
              <th className='py-2 text-primary'>Price</th>
              <th className='py-2 text-primary' style={{ minWidth: 100 }}>
                Action
              </th>
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
                <td className='text-center'>
                  <select
                    className='form-select form-select-sm mx-auto'
                    onChange={(e) => handleUpdateCart(item, e.target.value)}
                    style={{ maxWidth: 60 }}
                    value={item.quantity}
                  >
                    {/* The options rendered by item.countInStock will always be stale, but
                    handleUpdateCart() will mitigate this by checking the actual DB stock. */}
                    {[...Array(item.countInStock)].map((_n, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </td>
                <td className='text-center text-success'>${item.price}</td>
                <td className='text-center'>
                  <button
                    className='btn btn-danger btn-sm'
                    onClick={() => handleRemoveItem(item)}
                    title='Remove Item'
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
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
              <th colSpan={4} className='p-3'>
                <div className='text-center text-primary mb-3'>
                  Subtotal (
                  {cartItems.reduce(
                    (accumulator: any, item: any) =>
                      accumulator + item.quantity,
                    0
                  )}
                  ): $
                  {cartItems.reduce(
                    (accumulator: any, item: any) =>
                      accumulator + item.quantity * item.price,
                    0
                  )}
                </div>

                <button
                  onClick={() => router.push('/payment-info')}
                  className='d-block btn btn-success btn-sm fw-bold mx-auto'
                  style={{ minWidth: 200 }}
                >
                  Check Out
                </button>
              </th>
            </tr>
          </tfoot>
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
        <title>Shopping Cart</title>
        <meta name='description' content='Shopping Cart' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <CartoonFont
          style={{
            margin: '25px auto',
            textAlign: 'center'
          }}
        >
          Shopping Cart
        </CartoonFont>

        {renderTable()}
      </main>
    </Fragment>
  )
}

// This does not seem to affect the ability to implement getServerSideProps()
export default dynamic(() => Promise.resolve(CartPage), { ssr: false })
