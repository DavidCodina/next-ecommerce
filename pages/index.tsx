// Server imports
import connectDB from 'utils/db'
import Product from 'models/productModel'

// Third-party imports
import React, { Fragment } from 'react'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'react-toastify'

// Custom imports
import { ProductsFilter, ProductsPagination } from 'components'
import { useAppContext } from 'contexts'
import { getProduct } from 'client-api'
import { CartoonFont, ProductItem } from 'components'
import styles from 'styles/HomePage.module.scss'

const PAGE_SIZE = 2

/* ========================================================================
                                HomePage
======================================================================== */

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ brands, categories, products, productCount, pages }) => {
  const { addCartItem, cartItems } = useAppContext()
  const router = useRouter()
  const { query } = router
  let { page = '1' }: any = query
  page = Number(page)

  /* ======================
      handleAddCartItem()
  ====================== */

  const handleAddCartItem = async (item: any) => {
    // This is unlikely to occur, but doesn't hurt.
    if (!item) {
      toast.error('Sorry. The product may be unavailable at this time.')
      return
    }

    // Here we're NOT checking for the existence of the product in the database.
    // Rather, we're checking if the user has already added the product to cartItems.
    const existingCartItem = cartItems.find((x: any) => x._id === item._id)

    // existingCartItem (or its absence) is then conditionally used to set quantity.
    const quantity = existingCartItem ? existingCartItem.quantity + 1 : 1

    try {
      // Get product data from database in order affirm existence & check fresh countInStock.
      const { data: product } = await getProduct(item._id)

      // This could potentially occur if the user requested the page, a product was
      // found at that time, but then didn't interact with the page until days/weeks later.
      // Because an unknown amount of time will have elapsed, it's always good to check here.
      if (!product) {
        toast.error('Sorry. The product may be unavailable at this time.')
        return
      }

      // Return early if the requested quantity exceeds that of the stock.
      if (product.countInStock < quantity) {
        toast.error("Sorry. We don't have that quantity of this product.")
        return
      }

      const cartItem = { ...item, quantity }
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
      renderProducts()
  ====================== */

  const renderProducts = () => {
    if (!Array.isArray(products)) {
      return null
    }

    if (Array.isArray(products) && products.length === 0) {
      return null
    }

    return (
      <section
        style={{
          display: 'grid',
          gap: 15,
          gridAutoColumns: 'auto',
          gridAutoFlow: 'row',
          gridAutoRows: 'minmax(50px, auto)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gridTemplateRows: 'none'
        }}
      >
        {products.map((product: any) => (
          <ProductItem
            handleAddToCart={handleAddCartItem}
            key={product._id}
            product={product}
          />
        ))}
      </section>
    )
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Products</title>
        <meta name='description' content='Products' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <CartoonFont
          style={{
            margin: '25px auto',
            textAlign: 'center'
          }}
        >
          Products
        </CartoonFont>

        {/* ProductsFilter will return null if one or more of these
        props are falsy, or productCount is not a number. */}
        <ProductsFilter
          brands={brands}
          categories={categories}
          productCount={productCount}
          products={products}
        />

        {renderProducts()}

        {page > 0 &&
        pages > 0 &&
        typeof productCount === 'number' &&
        products ? (
          <section
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 25
            }}
          >
            <ProductsPagination
              className='pagination-sm shadow-sm'
              page={page}
              pages={pages}
              pageSize={PAGE_SIZE}
              productCount={productCount}
              products={products}
              style={{}}
            />
          </section>
        ) : null}
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const pageSize = Number(query.pageSize) || PAGE_SIZE
  const page = Number(query.page) || 1
  const brand = query.brand || ''
  const category = query.category || ''
  const name = query.name || ''
  const price = (query.price || '') as string
  const rating = query.rating || ''
  const sort = query.sort || ''

  const brandFilter = brand ? { brand } : {}
  const categoryFilter = category ? { category } : {}
  const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {}

  // price will be '' or a price.value such as '1-50'.
  // Thus we need to parse the string to get the  >= & <= values.
  // Then we need to turn them into numbers.
  const priceFilter = price
    ? {
        price: {
          $gte: Number(price.split('-')[0]),
          $lte: Number(price.split('-')[1])
        }
      }
    : {}

  const ratingFilter = rating ? { rating: { $gte: Number(rating) } } : {}

  const sortOrder: any =
    // if sort === 'lowest' then set order to { price: 1 }
    sort === 'lowest'
      ? { price: 1 }
      : // else if sort === 'highest' then set order to { price: -1 }
      sort === 'highest'
      ? { price: -1 }
      : // else if sort === 'toprate' then set order to { rating: -1 }
      sort === 'toprated'
      ? { rating: -1 }
      : // else if sort === 'newest' then set order to { createdAt: -1 }
      sort === 'newest'
      ? { createdAt: -1 }
      : // else if sort === 'oldest' then set order to { createdAt: 1 }
      sort === 'oldest'
      ? { createdAt: 1 }
      : // else set sort to { _id: -1 }
        { _id: -1 }

  try {
    await connectDB()

    const brands = await Product.find().distinct('brand')

    const categories = await Product.find().distinct('category') // => ['Pants', 'Shirts']

    let products: any = await Product.find({
      // Spread all filters...
      ...brandFilter,
      ...categoryFilter,
      ...nameFilter,
      ...priceFilter,
      ...ratingFilter
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean()
      .exec()

    const productCount: any = await Product.countDocuments({
      // Spread all filters...
      ...brandFilter,
      ...categoryFilter,
      ...nameFilter,
      ...priceFilter,
      ...ratingFilter
    })

    if (!products) {
      return {
        props: {
          brands: null,
          categories: null,
          productCount: 0,
          page: 1,
          pages: 1,
          products: null
        }
      }
    }

    products = JSON.parse(JSON.stringify(products)) // Or do: products = products.map(docToObj)

    return {
      props: {
        brands: brands,
        categories: categories,
        productCount: productCount,
        page: page,
        pages: Math.ceil(productCount / pageSize),
        products: products
      }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err.message)
    }
    return {
      props: {
        brands: null,
        categories: null,
        // For these next three props we could send back null without
        // Getting an error, but it seems better to use numbers.
        productCount: 0,
        page: 1,
        pages: 1,
        products: null
      }
    }
  }
}

export default HomePage
