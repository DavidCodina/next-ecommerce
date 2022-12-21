import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { SCNavBarContainer } from './styles'

/* ======================
      throttle()
====================== */

const throttle = (cb: any, delay = 1000) => {
  let shouldWait = false
  let waitingArgs: any

  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      cb(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args: any) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    cb(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }
}

/* =============================================================================
                                NavBarContainer
============================================================================= */
// Technically, this could be named TransitionOnScrollContainer, but that's a bit too verbose.

const NavBarContainer = ({ children }: any) => {
  const { pathname } = useRouter()
  const navBarContainerRef = useRef<HTMLElement | null>(null)
  const [classes, setClasses] = useState('')

  /* ======================
        useEffect()
  ====================== */
  ////////////////////////////////////////////////////////////////////////////////
  //
  // There was an issue such that when switching pages, the NavBarContainer would
  // continue to hide the NavBar, if that's what it was doing on the previous page.
  // To make things worse, if the new page did not have sufficient content to make
  // it scrollable, then there would be no way to get the NavBar back.
  //
  // This fixes that, so that the scrollbar is always reset whenever a new pathname is
  // registered. This might need to be refined later to account for situations where
  // we DO NOT want the it to reset (e.g., search parameters, etc.).
  //
  // The real issue here is that we want to check if the window
  // is scrollable and if it's not ALWAYS show the scrollbar.
  //
  ////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setClasses('ms-scrollbar-transition-none')
    setTimeout(() => {
      setClasses('')
    }, 250)
  }, [pathname])

  /* ======================
        useEffect()
  ====================== */

  useEffect(() => {
    const handleResize = () => {
      const isScrollable = window.innerHeight < document.body.scrollHeight
      // If !isScrollable, then we definitely don't want to hide the NavBar
      // because we won't be able to get it back. In such cases always remove
      // Because it's throttled at twice the duration of the pathname check,
      // it's unlikely that the two will conflict.
      if (!isScrollable) {
        setClasses('')
      }
    }

    const throttledHandleResize = throttle(() => {
      handleResize()
    }, 500)

    window.addEventListener('resize', throttledHandleResize)

    return () => window.removeEventListener('resize', throttledHandleResize)
  }, [])

  /* ======================
        useEffect()
  ====================== */
  ////////////////////////////////////////////////////////////////////////////////
  //
  // The above useEffect for checking resize will fix issues related to resizing.
  // However, if the NavBar was hidden, and then page content changes
  // such that the page is no longer scrollabe, then it won't detect that.
  //
  // One way I've found to really get around this is to set .main as follows:
  // .main { flex: 1; padding: 15px; width: 100%; min-height: 100vh; }
  // In other words, always set min-height such that there's enough scroll room
  // to get the NavBar back.
  //
  // Other than that, we could just set an interval timer that continuously checks
  // for scrollability. That seems like the best solution since NavBarContainer
  // can't always know when document.body.scrollHeight dynamically goes below
  // window.innherHeight.
  //
  ////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const scrollableInterval = setInterval(() => {
      const isScrollable = window.innerHeight < document.body.scrollHeight

      if (!isScrollable) {
        setClasses('')
      }
    }, 2000)

    return () => {
      clearInterval(scrollableInterval)
    }
  }, [])

  /* ======================
        useEffect()
  ====================== */
  // On mount, programatically set the paddingTop of the parentElement to account
  // for the NavBarContainer obscuring content due to being position:fixed.

  useEffect(() => {
    const navBarContainer = navBarContainerRef.current
    if (navBarContainer === null) {
      return
    }
    const navBarContainerHeight = navBarContainer.offsetHeight
    // It will never be null, so we can safely use the non-null assertion operator.
    const navBarContainerParent = navBarContainer.parentElement!
    navBarContainerParent.style.paddingTop = `${navBarContainerHeight}px`

    return () => {
      navBarContainerParent.style.paddingTop = ''
    }
  }, [])

  /* ======================
        useEffect()
  ====================== */
  // Set up a scroll listener to move NavBar off canvas when scrolling down,
  // and back on canvas when scrolling up

  useEffect(() => {
    const navBarContainer = navBarContainerRef.current

    if (navBarContainer === null) {
      return
    }

    const nav = navBarContainer.firstElementChild as HTMLElement

    if (!nav) {
      return
    }

    let previousWindowScrollY = 0
    // Why delta? It's a fancy mathematical synonym for 'difference'. We
    // could also just call this offset. Essentially, it represents how close
    // or far away from top the scroll must be before triggering the effect.
    const delta = 5
    const navbarHeight = nav.offsetHeight

    const handleScroll = () => {
      const windowScrollY = window.scrollY
      const windowHeight = window.innerHeight

      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )

      // Make sure that user scrolls more than delta
      if (Math.abs(previousWindowScrollY - windowScrollY) <= delta) {
        return
      }

      if (
        windowScrollY > previousWindowScrollY &&
        windowScrollY > navbarHeight
      ) {
        setClasses('ms-hide-nav')
      } else {
        if (windowScrollY + windowHeight < documentHeight) {
          setClasses('')
        }
      }

      previousWindowScrollY = windowScrollY
    }

    const throttledHandleScroll = throttle(() => {
      handleScroll()
    }, 100)

    window.addEventListener('scroll', throttledHandleScroll)
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [])

  /* ======================
          return
  ====================== */

  return (
    <SCNavBarContainer className={classes} ref={navBarContainerRef}>
      {children}
    </SCNavBarContainer>
  )
}

export { NavBarContainer }
