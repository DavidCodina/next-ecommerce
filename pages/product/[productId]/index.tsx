// Server imports
import Product from 'models/productModel'
import connectDB from 'utils/db'

// Third-party imports
import { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { toast } from 'react-toastify'

// Custom imports
import { useAppContext } from 'contexts'
import { getProduct } from 'client-api'
import { CartoonFont } from 'components'
import styles from './ProductPage.module.scss'

interface IProductPage {
  product: Record<string, any>
}

/* ========================================================================
                              ProductPage
======================================================================== */

const ProductPage = ({ product }: IProductPage) => {
  const { addCartItem, cartItems } = useAppContext()
  const router = useRouter()

  /* ======================
      handleAddCartItem()
  ====================== */

  const handleAddCartItem = async () => {
    if (!product) {
      // This would occur if the getServerSideProps() DB query failed.
      toast.error('Sorry. The product may be unavailable at this time.')
      return null
    }

    // Here we're NOT checking for the existence of the product in the database.
    // Rather, we're checking if the user has already added the product to cartItems.
    const existingCartItem = cartItems.find((x: any) => x._id === product._id)

    // existingCartItem (or its absence) is then conditionally used to set quantity.
    const quantity = existingCartItem ? existingCartItem.quantity + 1 : 1

    try {
      // Get product data from database in order affirm existence & check fresh countInStock.
      const { data: dbProduct } = await getProduct(product._id)

      // If the product was not found in the database, we won't render the UI.
      // Nonetheless, some time may have elapsed and it's always good to check here.
      // This could potentially occur if the user requested the page, a product was
      // found at that time, but then didn't interact with the page until days/weeks later.
      if (!dbProduct) {
        toast.error('Sorry. The product may be unavailable at this time.')
        return
      }

      // Return early if the requested quantity exceeds that of the actual stock.
      if (dbProduct.countInStock < quantity) {
        toast.error("Sorry. We don't have that quantity of this product.")
        return
      }

      const cartItem = { ...product, quantity }
      // Call addCartItem(), which internally calls setCartItems() in AppContext.
      addCartItem(cartItem)
      toast.success('The item has been added!')
    } catch (err) {
      // Presumably, this would only occur if the API call made from within
      // getProduct() went to the catch block, resulting in a rejected Promise.
      toast.error('Unable to add cart item.')
    }
  }

  /* ======================
       renderProduct()
  ====================== */

  const renderProduct = () => {
    if (!product) {
      return (
        <div className='alert alert-secondary border-secondary text-center'>
          <strong>Whoops!</strong> Could not find that product!
        </div>
      )
    }

    return (
      <div
        className='d-md-flex shadow-sm border border-primary'
        style={{
          borderRadius: 10,
          flexWrap: 'wrap',
          overflow: 'hidden'
        }}
      >
        <section style={{ flex: 1 }}>
          <img
            alt={product.name}
            src={product.image}
            style={{ display: 'block', width: '100%' }}
          />
        </section>

        <section
          className='p-3'
          style={{
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              gap: 15
            }}
          >
            <ul className='list-group small shadow-sm'>
              <li className='list-group-item py-1'>
                <strong className='text-secondary'>Category:</strong>{' '}
                {product.category}
              </li>
              <li className='list-group-item py-1'>
                <strong className='text-secondary'>Brand:</strong>{' '}
                {product.brand}
              </li>

              <li className='list-group-item py-1'>
                <strong className='text-secondary'>Description:</strong>{' '}
                {product.description}
              </li>

              <li className='list-group-item py-1'>
                <strong className='text-secondary'>{product.rating}</strong> of{' '}
                <strong className='text-secondary'>{product.numReviews}</strong>{' '}
                reviews
              </li>
            </ul>

            <div
              className='card shadow-sm'
              style={{ marginBottom: 25, minHeight: 121 }}
            >
              <div className='card-body p-2 d-flex flex-column'>
                <div style={{ flex: 1 }}>
                  <p className='d-flex justify-content-between small mb-1'>
                    <strong className='text-secondary'>Price:</strong>{' '}
                    <span>${product.price}</span>
                  </p>

                  <p className='d-flex justify-content-between small mb-1'>
                    <strong className='text-secondary'>Status:</strong>{' '}
                    <span>
                      {product.countInStock > 0 ? 'In stock' : 'Unavailable'}
                    </span>
                  </p>
                </div>

                <button
                  className='btn btn-success btn-sm d-block w-100 fw-bold'
                  onClick={handleAddCartItem}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>

          <button
            className='btn btn-primary btn-sm fw-bold d-block mx-auto'
            onClick={() => router.push('/')}
            style={{ minWidth: 200 }}
          >
            Back To Products
          </button>
        </section>
      </div>
    )
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Product Page</title>
        <meta name='description' content='A product details page' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          {product?.name || '???'}
        </CartoonFont>

        {renderProduct()}
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { productId } = context.params

  try {
    await connectDB()
    let product = await Product.findById(productId).lean().exec()

    if (!product) {
      return {
        props: {
          product: null
        }
      }
    }

    product = JSON.parse(JSON.stringify(product)) // Or use product = docToObj(product)

    return {
      props: {
        product: product
      }
    }
  } catch (err: any) {
    return {
      props: {
        product: null
      }
    }
  }
}

export default ProductPage
