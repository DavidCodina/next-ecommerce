// Server imports
import connectDB from 'utils/db'
import Product from 'models/productModel'

// Third-party imports
import React, { Fragment, useState } from 'react'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faXmarkCircle
} from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { useAppContext } from 'contexts'
import { getProduct } from 'client-api'
import { CartoonFont, ProductItem } from 'components'
import styles from 'styles/HomePage.module.scss'

// Used to populate the price <select>
const prices = [
  {
    name: '$1 to $50',
    value: '1-50'
  },
  {
    name: '$51 to $200',
    value: '51-200'
  },
  {
    name: '$201 to $1000',
    value: '201-1000'
  }
]

// Used to populate the ratings select.
const ratings = [1, 2, 3, 4, 5]
const PAGE_SIZE = 2 // Todo: Allow user to set dynamically

/* ========================================================================
                                HomePage
======================================================================== */

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ brands, categories, products, productCount, pages }) => {
  const { addCartItem, cartItems } = useAppContext()
  const router = useRouter()
  const { query } = router

  const {
    brand = '',
    category = '',
    name = '',
    price = '',
    rating = '',
    sort = ''
  }: any = query

  let { page = '1' }: any = query
  page = Number(page)

  // const isFirst = page === 1
  // const isLast = page * PAGE_SIZE >= productCount
  const isPrevious = page > 1
  const isNext = productCount > page * PAGE_SIZE
  const lastPage = pages // Math.ceil(productCount / PAGE_SIZE)

  const [nameSearch, setNameSearch] = useState(name)

  /* ======================
      filterSearch()
  ====================== */

  const filterSearch = (searchObject: any) => {
    const { brand, category, name, page, price, rating, sort } = searchObject

    // Really, what we're checking in each case is if x !== 'undefined'
    if (typeof brand === 'string') {
      query.brand = brand
    }

    if (typeof category === 'string') {
      query.category = category
    }

    if (typeof name === 'string') {
      query.name = name
    }

    if (typeof page === 'number') {
      query.page = page.toString()
    }

    if (typeof price === 'string') {
      query.price = price
    }

    if (typeof rating === 'string') {
      query.rating = rating
    }

    if (typeof sort === 'string') {
      query.sort = sort
    }

    // Loop through properties in query and remove any property where the value is ''.
    for (const property in query) {
      if (query[property] === '') {
        delete query[property]
      }
    }

    // Update the query string params, effectively reloading the page.
    router.push({
      pathname: router.pathname,
      query: query
    })
  }

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
    renderFilterFields()
  ====================== */

  const renderFilterFields = () => {
    if (!products) {
      return null
    }

    return (
      <Fragment>
        {/* Name Search: In this implementation we are maintaining nameSearch state,
        then calling filterSearch({ name: nameSearch }) on click of the associated
        search button. However, this is somewhat inconsistent with the way that the
        rest of the inputs work. A better approach would entail using a debounce hook
        on the nameSearch value, and automatically calling setNameSearch after about a
        second. */}

        <section className='row mb-2 gy-2 gx-3'>
          <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
            <label className='form-label'>Filter Products</label>

            <div className='input-group'>
              <input
                className='form-control form-control-sm'
                onChange={(e) => {
                  setNameSearch(e.target.value)
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    filterSearch({ name: nameSearch, page: 1 })
                  }
                }}
                placeholder='Search...'
                style={{ paddingRight: 22 }}
                type='text'
                value={nameSearch}
              />

              <FontAwesomeIcon
                icon={faXmarkCircle}
                onClick={() => {
                  setNameSearch('')
                  // You have to reset the page back to one for each new search
                  filterSearch({ name: '', page: 1 })
                }}
                role='button'
                style={{
                  color: '#ccc',
                  cursor: 'pointer',
                  outline: 'none',
                  position: 'absolute',
                  right: 35,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
                tabIndex={0}
              />

              <button
                className='btn btn-secondary btn-sm fw-bold'
                onClick={() => {
                  // You have to reset the page back to one for each new search
                  filterSearch({ name: nameSearch, page: 1 })
                }}
                title='Filter products by name'
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Category */}
          {Array.isArray(categories) && (
            <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
              <label className='form-label'>Category</label>
              <select
                className='form-select form-select-sm'
                onChange={(e) => {
                  filterSearch({ category: e.target.value })
                }}
                value={category}
              >
                <option value=''>All</option>
                {categories.map((category: any) => {
                  return (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Brand */}
          {Array.isArray(brands) && (
            <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
              <label className='form-label'>Brand</label>
              <select
                className='form-select form-select-sm'
                onChange={(e) => {
                  filterSearch({ brand: e.target.value })
                }}
                value={brand}
              >
                <option value=''>All</option>
                {brands.map((brand: any) => {
                  return (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Price */}
          {Array.isArray(prices) && (
            <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
              <label className='form-label'>Price</label>
              <select
                className='form-select form-select-sm'
                onChange={(e) => {
                  filterSearch({ price: e.target.value })
                }}
                value={price}
              >
                <option value=''>All</option>
                {prices.map((price: any) => {
                  return (
                    <option key={price.value} value={price.value}>
                      {price.name}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Rating */}
          {Array.isArray(ratings) && (
            <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
              <label className='form-label'>Rating</label>
              <select
                className='form-select form-select-sm'
                onChange={(e) => {
                  filterSearch({ rating: e.target.value })
                }}
                value={rating}
              >
                <option value=''>All</option>
                {ratings.map((rating: any) => {
                  return (
                    <option key={rating} value={rating}>
                      {rating}+ of 5
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Sort By */}
          {Array.isArray(ratings) && (
            <div className='col-12 col-sm-6 col-md-4 col-lg-2'>
              <label className='form-label'>Sort Products</label>
              <select
                className='form-select form-select-sm'
                onChange={(e) => {
                  filterSearch({ sort: e.target.value })
                }}
                value={sort}
              >
                <option value=''>Default</option>
                <option value='lowest'>Price: Low to High</option>
                <option value='highest'>Price: High to Low</option>
                <option value='toprated'>Customer Reviews</option>
                <option value='newest'>Newest</option>
                <option value='oldest'>Oldest</option>
              </select>
            </div>
          )}
        </section>

        {/* Search Summary */}
        <section
          style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 14,
            gap: 5,
            justifyContent: 'center',
            marginBottom: 15
          }}
        >
          <span className='text-primary fw-bold'>
            {products.length === 0 ? 'No' : productCount}{' '}
            {products.length === 1 ? 'Result' : 'Results'}
          </span>
          {name !== '' && (
            <Fragment>
              {' '}
              <span className='fw-bold text-secondary'>:</span> {name}
            </Fragment>
          )}

          {category !== '' && (
            <Fragment>
              {' '}
              <span className='fw-bold text-secondary'>:</span> {category}
            </Fragment>
          )}
          {brand !== '' && (
            <Fragment>
              {' '}
              <span className='fw-bold text-secondary'>:</span> {brand}
            </Fragment>
          )}

          {price !== '' && (
            <Fragment>
              {' '}
              <span className='fw-bold text-secondary'>:</span> ${price}
            </Fragment>
          )}
          {rating !== '' && (
            <Fragment>
              {' '}
              <span className='fw-bold text-secondary'>:</span> Rating {rating}+
            </Fragment>
          )}

          {(name !== '' ||
            category !== '' ||
            brand !== '' ||
            price !== '' ||
            rating !== '' ||
            sort !== '') && (
            <button
              className='btn text-danger p-0 m-0'
              style={{ lineHeight: 1 }}
              title='Reset Filter Criteria'
            >
              <FontAwesomeIcon
                icon={faXmarkCircle}
                onClick={() => {
                  setNameSearch('')
                  router.push('/')
                }}
                style={{ fontSize: 16 }}
              />
            </button>
          )}
        </section>
      </Fragment>
    )
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
          gridAutoColumns: 'auto', // Default: 'auto'. The grid-auto-columns property sets a size for the columns in a grid container
          gridAutoFlow: 'row', // Default: 'row'. The grid-auto-flow property controls how auto-placed items get inserted in the grid.
          gridAutoRows: 'minmax(50px, auto)', // Default: 'auto'. The grid-auto-rows property sets a size for the rows in a grid container.
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gridTemplateRows: 'none' // Default: 'none'. The grid-template-rows property specifies the number (and the heights) of the rows in a grid layout.
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
      renderPagination()
  ====================== */

  const renderPagination = () => {
    if (!Array.isArray(products) || products.length === 0) {
      return null
    }

    let pagesArray = [...Array(pages)].map((_, index: number) => index + 1)

    // Change pagesArray based on value of page.
    switch (page) {
      case 1:
        pagesArray = pagesArray.slice(0, 3)
        break

      case 2:
        pagesArray = pagesArray.slice(0, 3)
        break

      case pagesArray.length:
        pagesArray = [...pagesArray].reverse().slice(0, 3).reverse()
        break

      default:
        pagesArray = [page - 1, page]
        if (isNext) {
          pagesArray.push(page + 1)
        }
    }

    return (
      <section
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 25
        }}
      >
        <ul className='pagination pagination-sm shadow-sm'>
          {/* First Page */}
          <li className={`page-item${!isPrevious ? ' disabled' : ''}`}>
            <button
              className='page-link border-primary'
              disabled={!isPrevious}
              onClick={() => {
                filterSearch({ page: 1 })
              }}
            >
              «
            </button>
          </li>

          {/* Previous Page */}
          <li className={`page-item${!isPrevious ? ' disabled' : ''}`}>
            <button
              className='page-link border-primary'
              disabled={!isPrevious}
              onClick={(e) => {
                const newPage = page - 1 > 1 ? page - 1 : 1

                // Help make the active pagination item transition happen more smoothly.
                const target = e.target as HTMLButtonElement
                const pagination = target.parentElement?.parentElement
                const activeItem =
                  pagination?.querySelector('.page-item.active')
                const newActiveItem = pagination?.querySelector(
                  `[data-page="${newPage}"]`
                )

                if (activeItem) {
                  activeItem.classList.remove('active')
                }

                if (newActiveItem) {
                  newActiveItem.classList.add('active')
                }

                filterSearch({ page: newPage })
              }}
            >
              ‹
            </button>
          </li>

          {pagesArray.map((p) => {
            return (
              <li
                className={`page-item${page === p ? ' active' : ''}`}
                data-page={p}
                key={p}
              >
                <button
                  className='page-link border-primary'
                  onClick={(e) => {
                    // Help make the active pagination item transition happen more smoothly.
                    const target = e.target as HTMLButtonElement
                    const pagination = target.parentElement?.parentElement
                    const activeItem =
                      pagination?.querySelector('.page-item.active')
                    const newActiveItem = pagination?.querySelector(
                      `[data-page="${p}"]`
                    )

                    if (activeItem) {
                      activeItem.classList.remove('active')
                    }

                    if (newActiveItem) {
                      newActiveItem.classList.add('active')
                    }

                    filterSearch({ page: p })
                  }}
                >
                  {p}
                </button>
              </li>
            )
          })}

          {/* Next Page */}
          <li className={`page-item${!isNext ? ' disabled' : ''}`}>
            <button
              className='page-link border-primary'
              disabled={!isNext}
              onClick={(e) => {
                const newPage = page + 1 < pages ? page + 1 : pages

                // Help make the active pagination item transition happen more smoothly.
                const target = e.target as HTMLButtonElement
                const pagination = target.parentElement?.parentElement
                const activeItem =
                  pagination?.querySelector('.page-item.active')
                const newActiveItem = pagination?.querySelector(
                  `[data-page="${newPage}"]`
                )

                if (activeItem) {
                  activeItem.classList.remove('active')
                }

                if (newActiveItem) {
                  newActiveItem.classList.add('active')
                }

                filterSearch({ page: newPage })
              }}
            >
              ›
            </button>
          </li>

          {/* Last Page */}
          <li className={`page-item${!isNext ? ' disabled' : ''}`}>
            <button
              className='page-link border-primary'
              disabled={!isNext}
              onClick={() => {
                filterSearch({ page: lastPage })
              }}
            >
              »
            </button>
          </li>
        </ul>
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

        {renderFilterFields()}
        {renderProducts()}
        {renderPagination()}
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
