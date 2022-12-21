// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import connectDB from 'utils/db'
import User from 'models/userModel'

// Third-party imports
import { Fragment, useState } from 'react'
import Head from 'next/head'

import { signOut } from 'next-auth/react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { useAppContext } from 'contexts'
import { updateUser, deleteUser } from 'client-api'
import { CartoonFont } from 'components'
import styles from './ProfilePage.module.scss'

/* ========================================================================
                              ProfilePage
======================================================================== */
// The eCommerce App currently only implements a credentials login.
// However, if there were other login providers (Google, Facebook, etc.),
// then we'd want to have an accountProvider field in each user document. If
// the accountProvider was 'google', etc., we obviously wouldn't want the user to
// be able to change values like password, email, etc.
// Adding the accountProvider field to the associated user document would be done
// in [...nextauth].ts using the jwt() callback's account.provider property.

const ProfilePage = ({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { resetOrderInfo } = useAppContext()
  const [formValues, setFormValues] = useState({
    name: user?.name ? user.name : '',
    email: user?.email ? user.email : '',
    password: '',
    confirmPassword: ''
  })

  const [passwordType, setPasswordType] = useState('password')
  const [confirmPasswordType, setConfirmPasswordType] = useState('password')

  const [updatingUser, setUpdatingUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)

  /* ======================
      handleDeleteUser()
  ====================== */

  const handleDeleteUser = () => {
    if (!window.confirm('Are you sure you want to delete your acount?')) {
      return
    }

    setDeletingUser(true)

    deleteUser()
      .then((res: any) => {
        if (res?.success === true) {
          signOut({ callbackUrl: '/login' }).then(() => {
            toast.success('Your account has been deleted!')
            // No need to call Cookies.remove('cart') here. Why?
            // Because resetOrderInfo() already does it.
            resetOrderInfo()
          })
        }
      })

      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
          toast.error(err?.message)
        } else {
          toast.error('Unable to delete your account!')
        }
      })

      .finally(() => {
        setDeletingUser(false)
      })
  }

  /* ======================
      handleSubmit()
  ====================== */

  const handleSubmit = async (_e: any) => {
    // e.preventDefault() // Not necessary since it's not a submit event.
    const { name, email, password, confirmPassword } = formValues

    // None of the fields are necessarily required, but if a new password
    // is submitted, we want to make sure it's confirmed correctly.
    if (password && password !== confirmPassword) {
      toast.error('The passwords must match!')
      setFormValues({ ...formValues, password: '', confirmPassword: '' })
      setPasswordType('password')
      setConfirmPasswordType('password')
      return
    }

    // Update the user...
    setUpdatingUser(true)

    const requestData = {
      userId: user._id.toString(),
      name,
      email,
      password
    }

    updateUser(requestData)
      .then((_res) => {
        // Reset all form values.
        setFormValues({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })

        setPasswordType('password')
        setConfirmPasswordType('password')

        ///////////////////////////////////////////////////////////////////////////
        //
        // At this point, the user may have changed their name, email, or password.
        // Thus, we want to log the user back in again. In the Basir Udemy tutorial
        // this was done automatically using the values from the form inputs. However,
        // that implementation required all fields to be sumbitted. Thus that info would
        // be readily available on the client. This implementation does NOT require the user
        // to submit a new password. Moreover, for security reasons the password is not
        // sent back in the response data. Thus, if we want sign the user back in, we'll
        // need to sign them out here, then have THEM sign back in.
        // It's important to warn the user, so that they are aware that
        // they will lose information related to their current cart.
        //
        ///////////////////////////////////////////////////////////////////////////

        signOut({ callbackUrl: '/login' }).then(() => {
          toast.success('Profile updated successfully')
          // No need to call Cookies.remove('cart') here. Why?
          // Because resetOrderInfo() already does it.
          resetOrderInfo()
        })
      })
      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
        }

        // Reset all the password and confirmPassword only.
        setFormValues((prevFormValues) => {
          return {
            ...prevFormValues,
            password: '',
            confirmPassword: ''
          }
        })
        setPasswordType('password')
        setConfirmPasswordType('password')

        toast.error('An error occurred while updating the user profile!')
      })

      .finally(() => {
        setUpdatingUser(false)
      })
  }

  /* ======================
        handleChange()
  ====================== */

  const handleChange = (e: any) => {
    setFormValues((previousFormValues) => {
      return {
        ...previousFormValues,
        [e.target.name]: e.target.value
      }
    })
  }

  /* ======================
  renderDeleteUserButton()
  ====================== */

  const renderDeleteUserButton = () => {
    if (deletingUser) {
      return (
        <button
          className='d-block w-100 btn btn-danger btn-sm fw-bold'
          disabled
        >
          <span
            aria-hidden='true'
            className='spinner-border spinner-border-sm me-2'
            role='status'
          ></span>
          Permanently Deleting Your Account...
        </button>
      )
    }

    return (
      <button
        className='d-block w-100 btn btn-danger btn-sm fw-bold'
        onClick={handleDeleteUser}
      >
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          style={{ marginRight: 5 }}
        />
        Permanently Delete Your Account
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          style={{ marginLeft: 5 }}
        />
      </button>
    )
  }

  /* ======================
       renderForm()
  ====================== */

  const renderForm = () => {
    return (
      <div className='mx-auto' style={{ maxWidth: 500 }}>
        <form
          className='mx-auto mb-1 p-3 border border-primary rounded-3'
          style={{ backgroundColor: '#fafafa' }}
        >
          <div className='mb-3'>
            <label className='form-label' htmlFor='name'>
              Name:
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='name'
              name='name'
              onChange={handleChange}
              placeholder='Name...'
              type='text'
              value={formValues.name}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='email'>
              Email:
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='email'
              name='email'
              onChange={handleChange}
              placeholder='Email...'
              type='email'
              value={formValues.email}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='password'>
              Password:
            </label>

            <div className='input-group'>
              <input
                autoComplete='off'
                className='form-control form-control-sm'
                id='password'
                name='password'
                onChange={handleChange}
                placeholder='Password...'
                type={passwordType}
                value={formValues.password}
              />

              <button
                className='btn btn-outline-secondary btn-sm bg-white-unimportant'
                type='button'
                onClick={() => {
                  setPasswordType((previousValue) => {
                    if (previousValue === 'password') {
                      return 'text'
                    }
                    return 'password'
                  })
                }}
              >
                {passwordType === 'password' ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </button>
            </div>
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='confirm-password'>
              Confirm Password:
            </label>

            <div className='input-group'>
              <input
                autoComplete='off'
                className='form-control form-control-sm'
                id='confirm-password'
                name='confirmPassword'
                onChange={handleChange}
                placeholder='Confirm Password...'
                type={confirmPasswordType}
                value={formValues.confirmPassword}
              />

              <button
                className='btn btn-outline-secondary btn-sm bg-white-unimportant'
                type='button'
                onClick={() => {
                  setConfirmPasswordType((previousValue) => {
                    if (previousValue === 'password') {
                      return 'text'
                    }
                    return 'password'
                  })
                }}
              >
                {confirmPasswordType === 'password' ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </button>
            </div>
          </div>

          {updatingUser ? (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block w-100'
              type='button'
              disabled
            >
              <span
                aria-hidden='true'
                className='spinner-border spinner-border-sm me-2'
                role='status'
              ></span>
              Updating Profile
            </button>
          ) : (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block w-100'
              onClick={handleSubmit}
              type='button'
            >
              Update Profile
            </button>
          )}
        </form>
        <div className='text-danger' style={{ fontSize: 12, marginBottom: 25 }}>
          <strong>Note:</strong> Updating your profile will require you to log
          back in. Any items currently in your cart will be removed.{' '}
        </div>

        {renderDeleteUserButton()}
      </div>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Profile</title>
        <meta name='description' content='Profile' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Profile
        </CartoonFont>

        {renderForm()}
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session: any = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  ) // => session | null

  if (!session || !session?.user?.id) {
    return {
      redirect: {
        destination: '/login',
        permanent: false // Always set permanent:false to indicate that it's only this time that we want to redirect.
      }
    }
  }

  try {
    await connectDB()

    let user = await User.findById(session.user.id).lean().exec()

    if (user) {
      user = JSON.parse(JSON.stringify(user))
    }

    delete user.password

    return {
      props: {
        user: user
      }
    }
  } catch (err) {
    return {
      props: {
        user: null
      }
    }
  }
}

export default ProfilePage
