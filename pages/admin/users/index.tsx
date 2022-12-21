// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import connectDB from 'utils/db'
import User from 'models/userModel'

// Third-party imports
import { Fragment, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Custom imports
import { CartoonFont } from 'components'
import { adminGetUsers as apiAdminGetUsers, adminDeleteUser } from 'client-api'
import styles from './AdminUsersPage.module.scss'

/* ========================================================================
                                AdminUsersPage
======================================================================== */

const AdminUsersPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ users: usersProp }) => {
  const router = useRouter()
  const { data: session }: any = useSession()
  const [users, setUsers] = useState<any>(usersProp)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)

  /* ======================
      adminGetUsers()
  ====================== */
  // adminGetUsers() is called on success of  a user being deleted.
  // It reloads fresh users data.

  const adminGetUsers = () => {
    setLoadingUsers(true)

    apiAdminGetUsers()
      .then((res) => {
        const { data, success } = res

        if (success === true && data) {
          setUsers(data)
        }
      })

      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          toast.error(err.message)
          console.log(err)
        } else {
          toast.error('Unable to get users!')
        }
      })

      .finally(() => {
        setLoadingUsers(false)
      })
  }

  /* ======================
      handleDeleteUser()
  ====================== */

  const handleDeleteUser = async (userId: string) => {
    // Return early if the admin tries to delete themself.
    // A similar check also exists on the server side.
    // Since this assumes the user is an admin, we can do userId === session?.user?.id
    // However, just to be safe we can add the second check.
    if (
      userId === session?.user?.id &&
      session?.user?.roles?.includes('admin')
    ) {
      toast.error('Whoops! Admins may not delete themselves!')
      return
    }

    if (!window.confirm('Are you sure?')) {
      return
    }

    setDeletingUser(true)

    adminDeleteUser(userId)
      .then((res: any) => {
        console.log(res)
        toast.success('User deleted!')
        adminGetUsers()
      })

      .catch((err: any) => {
        if (process.env.NODE_ENV === 'development') {
          toast.error(err.message)
          console.log(err)
        } else {
          toast.error('Unable to delete user!')
        }
      })

      .finally(() => {
        setDeletingUser(false)
      })
  }

  /* ======================
    renderUsersTable()
  ====================== */

  const renderUsersTable = () => {
    //# We may want to make this better...
    if (loadingUsers) {
      return <h3 className='text-center fw-bold text-secondary'>Loading...</h3>
    }

    //# We may want to make this better, or also differentiate between no users,
    //# and null users which would imply an error.
    if (!users || (Array.isArray(users) && users.length === 0)) {
      return (
        <div className='alert alert-info border-info rounded-3'>
          Whoops! There are no users!
        </div>
      )
    }

    return (
      <div
        className='table-responsive rounded-3 mx-auto shadow-sm border border-primary'
        style={{ marginBottom: 25 }}
      >
        <table
          className='table table-striped table-hover table-bordered table-flush table-sm bg-white align-middle'
          style={{
            fontSize: 14,
            margin: 0
          }}
        >
          <thead
            className='text-center'
            style={{
              borderBottom: '2px solid #ccc'
            }}
          >
            <tr>
              <th className='py-2 text-primary'>id</th>
              <th className='py-2 text-primary'>Name</th>
              <th className='py-2 text-primary'>Email</th>
              <th className='py-2 text-primary'>Admin</th>
              <th className='py-2 text-primary' style={{ width: 180 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user._id}>
                <td className='text-center'>{user._id.substring(20, 24)}</td>
                <td className='text-center'>{user.name}</td>
                <td className='text-center'>{user.email}</td>
                <td className='text-center'>
                  {user.roles.includes('admin') ? 'Yes' : 'No'}
                </td>
                <td className='text-center'>
                  <div className='btn-group'>
                    {/* To Do: Create this page. Then uncomment the button. */}
                    {/* <button
                      className='btn btn-outline-secondary btn-sm fw-bold bg-white-unimportant'
                      onClick={() => router.push(`/admin/user/${user._id}`)}
                      style={{ minWidth: 75 }}
                    >
                      Edit
                    </button> */}

                    {deletingUser ? (
                      <button
                        className='btn btn-outline-danger btn-sm fw-bold'
                        disabled
                        style={{
                          backgroundColor: '#fff',
                          minWidth: 75,
                          opacity: 1
                        }}
                      >
                        <span
                          className='spinner-border spinner-border-sm'
                          role='status'
                          aria-hidden='true'
                        ></span>
                      </button>
                    ) : (
                      <button
                        className='btn btn-outline-danger btn-sm fw-bold bg-white-unimportant'
                        onClick={() => handleDeleteUser(user._id)}
                        style={{ minWidth: 75 }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Admin Users</title>
        <meta name='description' content='Admin Users' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Admin Users
        </CartoonFont>

        <section style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className='btn-group mx-auto mb-5 hide-scrollbar'
            style={{
              display: 'flex',
              overflowX: 'scroll',
              borderRadius: 0
            }}
          >
            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/dashboard')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Dashboard
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/orders')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Orders
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/products')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Products
            </button>

            <button
              className='btn btn-outline-primary btn-sm fw-bold bg-white-unimportant'
              onClick={() => router.push('/admin/users')}
              style={{ flex: '0 1 auto', minWidth: 100 }}
            >
              Users
            </button>
          </div>
        </section>

        {renderUsersTable()}
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

  // Return early if user is unauthenticated
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false // Always set permanent:false to indicate that it's only this time that we want to redirect.
      }
    }
  }

  // Return early if user does not have sufficient privileges/roles
  // If there is a session, but the user does not have the correct
  // authorization (not admin), then redirect them to the 403 page.
  if (!session?.user?.roles.includes('admin')) {
    return {
      redirect: {
        destination: '/403',
        permanent: false
      }
    }
  }

  // If authorized, then get data from database.
  try {
    await connectDB()

    let users = await User.find().lean().exec()

    if (users) {
      users = JSON.parse(JSON.stringify(users)) // Or do: users = users.map(docToObj)
    }

    return {
      props: {
        users: users
      }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }

    return {
      props: {
        users: null
      }
    }
  }
}

export default AdminUsersPage
