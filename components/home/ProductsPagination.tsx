// Third-party imports
import { useRouter } from 'next/router'

/* ========================================================================
                              ProductsPagination
======================================================================== */

export const ProductsPagination = ({
  className = '',
  page,
  pages,
  pageSize,
  productCount,
  products,
  style = {}
}: any) => {
  const router = useRouter()
  const { query } = router

  // const isFirst = page === 1
  // const isLast = page * PAGE_SIZE >= productCount
  const isPrevious = page > 1
  const isNext = productCount > page * pageSize
  const lastPage = pages // Math.ceil(productCount / PAGE_SIZE)

  if (!Array.isArray(products) || products.length === 0) {
    return null
  }

  /* ======================
        pagesArray 
  ====================== */

  let pagesArray = [...Array(pages)].map((_, index: number) => index + 1)

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

  /* ======================
          return 
  ====================== */

  return (
    <ul
      className={`pagination${className ? ` ${className}` : ''}`}
      style={style}
    >
      {/* First Page */}
      <li className={`page-item${!isPrevious ? ' disabled' : ''}`}>
        <button
          className='page-link border-primary'
          disabled={!isPrevious}
          onClick={() => {
            query.page = '1'
            router.push({
              pathname: router.pathname,
              query: query
            })
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
            // This part is to help make the active pagination item transition happen more smoothly.
            const target = e.target as HTMLButtonElement
            const pagination = target.parentElement?.parentElement
            const activeItem = pagination?.querySelector('.page-item.active')
            const newActiveItem = pagination?.querySelector(
              `[data-page="${newPage}"]`
            )

            if (activeItem) {
              activeItem.classList.remove('active')
            }

            // The <li>'s className will add .active when the new data is rendered.
            // This just speeds it up, so it doesn't feel so sluggish.
            if (newActiveItem) {
              newActiveItem.classList.add('active')
            }

            query.page = newPage.toString()
            router.push({
              pathname: router.pathname,
              query: query
            })
          }}
        >
          ‹
        </button>
      </li>

      {pagesArray.map((p: number) => {
        return (
          <li
            className={`page-item${page === p ? ' active' : ''}`}
            data-page={p}
            key={p}
          >
            <button
              className='page-link border-primary'
              onClick={(e) => {
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

                query.page = p.toString()
                router.push({
                  pathname: router.pathname,
                  query: query
                })
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
            const target = e.target as HTMLButtonElement
            const pagination = target.parentElement?.parentElement
            const activeItem = pagination?.querySelector('.page-item.active')
            const newActiveItem = pagination?.querySelector(
              `[data-page="${newPage}"]`
            )

            if (activeItem) {
              activeItem.classList.remove('active')
            }

            if (newActiveItem) {
              newActiveItem.classList.add('active')
            }

            query.page = newPage.toString()
            router.push({
              pathname: router.pathname,
              query: query
            })
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
            query.page = lastPage.toString()
            router.push({
              pathname: router.pathname,
              query: query
            })
          }}
        >
          »
        </button>
      </li>
    </ul>
  )
}
