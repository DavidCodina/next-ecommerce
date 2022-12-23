// Third-party imports
import { Fragment, useState } from 'react'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faXmarkCircle
} from '@fortawesome/free-solid-svg-icons'

interface ISearchObject {
  brand?: string
  category?: string
  name?: string
  page?: string
  price?: string
  rating?: string
  sort?: string
}

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

/* ========================================================================
                              ProductsFilter
======================================================================== */

export const ProductsFilter = ({
  brands,
  categories,

  productCount,
  products
}: any) => {
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

  const [nameSearch, setNameSearch] = useState(name)

  /* ======================
      filterSearch()
  ====================== */

  const filterSearch = (searchObject: ISearchObject) => {
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

    if (typeof page === 'string') {
      query.page = page
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

  if (!products) {
    return null
  }

  /* ======================
          return
  ====================== */
  // If any of the props are not there, then return null prices and
  // ratings are defined in this file, so they will always be here.

  if (!brands || !categories || typeof productCount !== 'number' || !products) {
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
                  // You MUST reset the page back to '1' for each new search, excepting sorting.
                  // This needs to be done for EVERY call to filterSearch({ ... }). Otherwise,
                  // you'll potentiallly end up with no results when there are actually results.
                  filterSearch({ name: nameSearch, page: '1' })
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
                filterSearch({ name: '', page: '1' })
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
                filterSearch({ name: nameSearch, page: '1' })
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
                filterSearch({ category: e.target.value, page: '1' })
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
                filterSearch({ brand: e.target.value, page: '1' })
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
                filterSearch({ price: e.target.value, page: '1' })
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
                filterSearch({ rating: e.target.value, page: '1' })
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
                // Sorting will not change the number of results, so there's no need to add page: '1'
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
