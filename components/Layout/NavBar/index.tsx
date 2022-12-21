// Third-party imports
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Luckiest_Guy } from '@next/font/google'
import { signOut, useSession } from 'next-auth/react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingCart,
  faUserCircle, // log in
  faRightFromBracket, // log out
  faUserPen, // register
  faUserGear // admin
} from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { useAppContext } from 'contexts'
import { CustomToggle } from './CustomToggle'

// Known Issue (12.19.2022): This will break Storybook. The SB team is working on it.
const luckiestGuy = Luckiest_Guy({
  weight: '400',
  subsets: ['latin'],
  style: ['normal']
})

interface INavBar {
  containerMaxWidth: number
}

/* =============================================================================
                                  NavBar
============================================================================= */

export const NavBar = ({ containerMaxWidth }: INavBar) => {
  const { cartItems, resetOrderInfo } = useAppContext()
  const { data: session, status } = useSession()

  const router = useRouter()
  const [show, setShow] = useState(false)

  // Sum the item.quanity across all items.
  const totalCartItemQuantity = cartItems.reduce(
    (accumulator: any, item: any) => {
      return accumulator + item.quantity
    },
    0
  )

  /* ======================
      toggleCollapse()
  ====================== */

  const toggleCollapse = () => {
    setShow((v) => !v)
  }

  /* ======================
        handleLogOut()
  ====================== */
  // Here we would also want to clear any user-specific global state,
  // cookies, localStorage, etc.

  const handleLogOut = () => {
    signOut({ callbackUrl: '/login' }).then(() => {
      // No need to call Cookies.remove('cart') here. Why?
      // Because resetOrderInfo() already does it.
      resetOrderInfo()
    })
    setShow(false)
  }

  /* ======================
      renderCartLink()
  ====================== */

  const renderCartLink = () => {
    return (
      <Link
        className={`nav-link py-lg-0${
          router.pathname === '/cart' ? ' active' : ''
        }`}
        href='/cart'
        onClick={() => {
          setShow(false)
        }}
      >
        <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: 5 }} />
        Cart{' '}
        {totalCartItemQuantity > 0 && (
          <span
            className='badge text-bg-success'
            style={{
              display: 'inline-flex',
              boxShadow: '0px 0px 0px 3px var(--bs-success)',
              fontSize: 12,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 11,
              lineHeight: 1,
              padding: 0,
              height: 20,
              width: 20,
              margin: '0px 0px 0px 5px'
            }}
          >
            {totalCartItemQuantity <= 99 ? totalCartItemQuantity : '99+'}
          </span>
        )}
      </Link>
    )
  }

  /* ======================
       renderNav()
  ====================== */

  const renderNav = () => {
    if (session) {
      return (
        <Nav className='ms-auto'>
          {(session?.user as any)?.roles?.includes('admin') && (
            <Dropdown className='nav-item me-1'>
              <Dropdown.Toggle
                variant='none'
                className={`nav-link py-lg-0${
                  router.pathname.includes('/admin') ? ' active' : ''
                }`}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  // Why are we doing it here as well? Because there is a stupid :active
                  // style that react-bootstrap applies.
                  color: router.pathname.includes('/admin')
                    ? '#fff'
                    : 'rgb(255, 255, 255, 0.55)'
                }}
              >
                <FontAwesomeIcon icon={faUserGear} style={{ marginRight: 5 }} />{' '}
                Admin
              </Dropdown.Toggle>

              <Dropdown.Menu
                className='border-primary py-0 overflow-hidden mt-lg-3 shadow'
                popperConfig={{}} // super difficult to figure this out
                style={{
                  fontSize: 14,
                  minWidth: '100%',
                  position: 'absolute'
                }}
              >
                {/* Use the Dropdown.Item to take advantage of the default behavior 
                of the menu closing when the item is clicked. */}
                <Dropdown.Item as='div' className='p-0'>
                  <Link
                    href='/admin/dashboard'
                    onClick={() => {
                      setShow(false)
                    }}
                    style={{
                      color: 'inherit',
                      display: 'block',
                      padding: 5,
                      textDecoration: 'none'
                    }}
                  >
                    Dashboard
                  </Link>
                </Dropdown.Item>

                <Dropdown.Item as='div' className='p-0'>
                  <Link
                    href='/admin/orders'
                    onClick={() => {
                      setShow(false)
                    }}
                    style={{
                      color: 'inherit',
                      display: 'block',
                      padding: 5,
                      textDecoration: 'none'
                    }}
                  >
                    Orders
                  </Link>
                </Dropdown.Item>

                <Dropdown.Item as='div' className='p-0'>
                  <Link
                    href='/admin/products'
                    onClick={() => {
                      setShow(false)
                    }}
                    style={{
                      color: 'inherit',
                      display: 'block',
                      padding: 5,
                      textDecoration: 'none'
                    }}
                  >
                    Products
                  </Link>
                </Dropdown.Item>

                <Dropdown.Item as='div' className='p-0'>
                  <Link
                    href='/admin/users'
                    onClick={() => {
                      setShow(false)
                    }}
                    style={{
                      color: 'inherit',
                      display: 'block',
                      padding: 5,
                      textDecoration: 'none'
                    }}
                  >
                    Users
                  </Link>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

          {renderCartLink()}

          <Link
            className={`nav-link py-lg-0${
              router.pathname === '/profile' ? ' active' : ''
            }`}
            href='/profile'
            onClick={() => {
              setShow(false)
            }}
          >
            <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: 5 }} />
            Profile
          </Link>

          <Link
            className={`nav-link py-lg-0${
              router.pathname === '/order-history' ? ' active' : ''
            }`}
            href='/order-history'
            onClick={() => {
              setShow(false)
            }}
          >
            Order History
          </Link>

          <button
            className='nav-link py-lg-0'
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'left'
            }}
            onClick={handleLogOut}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              style={{ marginRight: 5 }}
            />
            Log Out
          </button>
        </Nav>
      )
    }

    if (!session && status !== 'loading')
      return (
        <Nav className='ms-auto'>
          {renderCartLink()}

          <Link
            className={`nav-link py-lg-0${
              router.pathname === '/register' ? ' active' : ''
            }`}
            href='/register'
            onClick={() => {
              setShow(false)
            }}
          >
            <FontAwesomeIcon icon={faUserPen} style={{ marginRight: 5 }} />
            Register
          </Link>

          <Link
            className={`nav-link py-lg-0${
              router.pathname === '/login' ? ' active' : ''
            }`}
            href='/login'
            onClick={() => {
              setShow(false)
            }}
          >
            <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: 5 }} />
            Log in
          </Link>
        </Nav>
      )

    return null
  }

  /* ======================
          return
  ====================== */

  return (
    <Navbar
      // bg='primary'
      expand='lg'
      expanded={show}
      style={{
        backgroundColor: '#409',
        backgroundImage: 'linear-gradient(-90deg, #00affa, #3b128d)',
        boxShadow: 'inset 0px -1px 0px rgba(0, 0, 0, 0.25)'
        // paddingTop: 8,
        // paddingBottom: 8
      }}
      variant='dark'
    >
      <div
        className='container-fluid'
        style={{
          // Should match whatever the maxWidth is in the content layout.
          maxWidth: containerMaxWidth
          // Setting minHeight here is to prevent the shift that occurs when the
          // CustomToggle is present. This div switches from 24 to 30px. Here
          // we can make it always 30px with: minHeight: 30
          // However, instead of doing this, I've done this inside of CustomToggle:
          // style={{ position: 'absolute', top: 5, right: 5 }}
          // This prevents the hamburger from pushing out on this .container-fluid
        }}
      >
        <Link
          id='brand'
          className='navbar-brand p-0'
          href='/'
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 10
          }}
        >
          {/* <Image
            src={logo}
            alt='logo'
            style={{
              display: 'block',
              width: 'auto',
              maxHeight: 30
            }}
          /> */}

          <span
            // These styles are all just for 'Luckiest Guy' because
            // it has weird positioning by default.
            style={{
              fontSize: 24,
              letterSpacing: 0.5,
              lineHeight: 1,
              position: 'relative',
              top: '3.5px'
            }}
            className={luckiestGuy.className}
          >
            E-Commerce Site
          </span>
        </Link>

        <CustomToggle show={show} toggleCollapse={toggleCollapse} />

        <Navbar.Collapse>{renderNav()}</Navbar.Collapse>
      </div>
    </Navbar>
  )
}
