import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faHome } from '@fortawesome/free-solid-svg-icons'

/* =============================================================================
                                ErrorPage
============================================================================= */
///////////////////////////////////////////////////////////////////////////
//
// Technically, this component is not a page, but from the user's perspective
// it is. This can be tested by adding the following logic to any page.
//
//   const [items, setItems] = useState<any>([])
//   <button
//     className='d-block mx-auto mb-5 btn btn-success btn-sm fw-bold'
//     onClick={() => { setItems(undefined) }
//   >Break The Page!</button>
//   {items.map(() => null)}
//
///////////////////////////////////////////////////////////////////////////

const ErrorPage = ({ error, resetErrorBoundary }: any) => {
  const router = useRouter()
  const { pathname } = router
  const firstRenderRef = useRef(true)
  //const [imgLoaded, setImgLoaded] = useState(false)

  /* ======================
        useEffect()
  ====================== */
  // This is the best place to call resetErrorBoundary() because it allows
  // the user to click on the navigation links and automatically reset the
  // error boundary.

  useEffect(() => {
    if (firstRenderRef.current === true) {
      firstRenderRef.current = false
      return
    }
    return () => resetErrorBoundary()
  }, [pathname, resetErrorBoundary])

  /* ======================
      renderContent()
  ====================== */
  // There was an issue where it took the browser a half second to load the image.
  // This resulted in the text rendering, then the image blinking in a momement later.
  // One strategy to prevent this type of behavior is to use onLoad, and wait until
  // the image is ready before showing anything. To do this, a dummy img is first rendered
  // with display:none. Once onLoad happens, the image is now cached in browser memory, and
  // we can unmount that and instead render the actual content.

  const renderContent = () => {
    // if (!imgLoaded) {
    //   return (
    //     <img
    //       alt='Sad Panda'
    //       src='/images/sad-panda.png'
    //       style={{ display: 'none' }}
    //       onLoad={() => {
    //         setImgLoaded(true)
    //       }}
    //     />
    //   )
    // }

    return (
      <div className='text-center'>
        <img
          alt='Sad Panda'
          src='/images/sad-panda.png' // 'https://templates.mainstem.io/images/sad-panda.png'
          style={{ marginBottom: 25, maxHeight: '150px' }}
        />

        <h3 className='text-primary fw-bold'>Uh Oh...</h3>

        {process.env.NODE_ENV === 'development' && error.message && (
          <p
            className='text-danger fw-bold'
            style={{ fontSize: 14, marginBottom: 10 }}
          >
            {error.message}
          </p>
        )}

        <p style={{ fontSize: 14, margin: '0 auto 25px auto', maxWidth: 450 }}>
          It looks like something did not go as expected. Our team has been
          notified about this error and we will look into it right away!
        </p>

        <div className='btn-group shadow-sm'>
          <button
            className='btn btn-secondary btn-sm fw-bold'
            onClick={() => {
              // In a normal CRA app with React Router, calling resetErrorBoundary()
              // here won't work because the error ends up reoccurring before redirection
              // completes. However, in Next it seems to work. Nonetheless, it's still better
              // to call it from the useEffect()

              if (pathname === '/') {
                // Don't do this: window.location.reload()
                // In fact, don't do this either: router.reload()
                // Here we only need to reset the error boundary.
                resetErrorBoundary()
              } else {
                router.push('/')
              }
            }}
            style={{ minWidth: 150 }}
          >
            <FontAwesomeIcon icon={faHome} style={{ marginRight: 5 }} />
            Go Home
          </button>
          <button
            className='btn btn-primary btn-sm fw-bold'
            onClick={() => {
              // Using router.back() would actually go back to the PREVIOUS page.
              // However, from the user's perspective the ErrorPage is an actual page.
              // Thus, the 'Go Back' button should just attempt to rerender the initial page.
              resetErrorBoundary()
            }}
            style={{ minWidth: 150 }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: 5 }} />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <div style={{ flex: 1, padding: 50, width: '100%' }}>{renderContent()}</div>
  )
}

export default ErrorPage
