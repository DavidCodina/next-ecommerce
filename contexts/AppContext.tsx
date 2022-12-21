import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'

export interface AppContextValue {
  addCartItem: (newItem: any) => void
  removeCartItem: (itemId: string) => void
  resetCartItems: () => void
  [key: string]: any
}

/* =============================================================================

============================================================================= */

export const AppContext = createContext({} as AppContextValue)
export const AppConsumer = AppContext.Consumer

export const AppProvider = (props: { children: React.ReactNode }) => {
  const router = useRouter()

  // Persist cartItems across refreshes.
  const [cartItems, setCartItems] = useState<any[]>(() => {
    const cart = Cookies.get('cart')
      ? JSON.parse(Cookies.get('cart') as string)
      : {}
    return Array.isArray(cart?.cartItems) ? cart?.cartItems : []
  })

  // Persist paymentInfo across refreshes.
  const [paymentInfo, setPaymentInfo] = useState<any>(() => {
    const cart = Cookies.get('cart')
      ? JSON.parse(Cookies.get('cart') as string)
      : {}
    return cart?.paymentInfo ? cart?.paymentInfo : {}
  })

  /* ======================
      resetCartItems()
  ====================== */
  // Simple helper, but better to use this for predictability/consistency
  // rather than risking the possibility that someone will set it to null.

  const resetCartItems = () => {
    setCartItems([])
  }

  /* ======================
      resetOrderInfo()
  ====================== */

  const resetOrderInfo = useCallback(() => {
    Cookies.remove('cart')
    setCartItems([])
    setPaymentInfo({})
  }, [])

  /* ======================
      removeCartItem()
  ====================== */

  const removeCartItem = (itemId: any) => {
    setCartItems((prevCartItems: any) => {
      const newCartItems = prevCartItems.filter(
        (item: any) => item._id !== itemId
      )
      return newCartItems
    })

    toast.success('The item has been removed!')
  }

  /* ======================
        addCartItem()
  ====================== */

  const addCartItem = (newItem: any) => {
    if (!newItem) {
      return
    }

    //# Better if we do it in prevCartItems...
    // Check if the item already exists in cartItems.
    const existingItem = cartItems.find((item: any) => item._id === newItem._id)
    console.log({ existingItem })

    // If the item already exists in the cart, then we need to map over
    // the cartItems and replace the existingItem with newItem Why? Because
    // the newItem contains the new quantity. Otherwise, keep the same cartItems as they are.
    // If there is no existingItem, then we simply add it: [...cartItems, newItem]
    const newCartItems = existingItem
      ? cartItems.map((item: any) => {
          return item.name === existingItem.name ? newItem : item
        })
      : [...cartItems, newItem]

    setCartItems(newCartItems)
  }

  /* ======================
        useEffect()
  ====================== */
  // This useEffect updates the 'cart' cookie

  useEffect(() => {
    const cart = {
      cartItems,
      paymentInfo
    }

    Cookies.set('cart', JSON.stringify(cart))
  }, [cartItems, paymentInfo])

  /* ======================
        useEffect()
  ====================== */
  // This useEffect() sets up an idle listener based on click events.
  // It could be improved by also listening for scroll events,
  // cursor events, keyboard events, etc. Also, rather than clearning
  // the cart, it may be better to just log them out.

  useEffect(() => {
    const delay = 60 * 60 * 1000
    const warningDelay = delay - 15 * 1000

    // Reusable function for generating warning timeouts
    const createWarningTimeout = () => {
      return setTimeout(() => {
        if (
          (Array.isArray(cartItems) && cartItems.length > 0) ||
          (typeof paymentInfo === 'object' &&
            Object.keys(paymentInfo).length > 0)
        ) {
          toast.warn(
            'Your order will be cleared in 10 seconds if you remain idle.'
          )
        }
      }, warningDelay)
    }

    // Reusable function for generating warning remove cart timeouts.
    const createRemoveCartTimeout = () => {
      if (
        (Array.isArray(cartItems) && cartItems.length > 0) ||
        (typeof paymentInfo === 'object' && Object.keys(paymentInfo).length > 0)
      ) {
        return setTimeout(() => {
          Cookies.remove('cart')
          setCartItems([])
          setPaymentInfo({})
          toast.warn('The order has been cleared due to inactivity!')
          router.push('/')
        }, delay)
      }
    }

    // Set initial timeouts
    let warningTimeout = createWarningTimeout()
    let cartTimeout = createRemoveCartTimeout()

    const handleClick = () => {
      clearTimeout(warningTimeout)
      clearTimeout(cartTimeout)
      warningTimeout = createWarningTimeout() // Set new warningTimeout
      cartTimeout = createRemoveCartTimeout() // Set new cartTimeout
    }

    document.body.addEventListener('click', handleClick)
    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(cartTimeout)
      document.body.removeEventListener('click', handleClick)
    }
  }, [cartItems, paymentInfo, router])

  /* ======================
          return
  ====================== */

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addCartItem,
        removeCartItem,
        resetCartItems,
        paymentInfo,
        setPaymentInfo,
        resetOrderInfo
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const value = useContext(AppContext)
  return value
}
