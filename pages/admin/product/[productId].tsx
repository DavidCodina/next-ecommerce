// Server imports
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Product from 'models/productModel'
import connectDB from 'utils/db'

// Third-party imports
import { Fragment, useState, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { CartoonFont } from 'components'
import styles from './AdminProductPage.module.scss'

/* ========================================================================
                            AdminProductPage
======================================================================== */

const AdminProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => {
  const router = useRouter()
  const { productId } = router.query

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [updatingProduct, setUpdatingProduct] = useState(false)
  const [updatingImage, setUpdatingImage] = useState(false)

  // Form values...
  const [name, setName] = useState<string>(product?.name || '')
  const [price, setPrice] = useState<string>(() => {
    return typeof product?.price === 'number' ? product?.price.toString() : ''
  })
  const [imageURL, setImageURL] = useState<string>(product?.image || '')
  const [category, setCategory] = useState<string>(product?.category || '')
  const [brand, setBrand] = useState<string>(product?.brand || '')
  const [countInStock, setCountInStock] = useState(() => {
    return typeof product?.countInStock === 'number'
      ? product?.countInStock.toString()
      : ''
  })
  const [description, setDescription] = useState(product?.description || '')

  /* ======================
    destroyPreviousImage()
  ====================== */
  // This function is called within handleImageUpdate().
  // It's used to delete the old product image prior to adding a new one.

  const destroyPreviousImage = async () => {
    if (!imageURL) {
      return
    }

    // Gotcha: The Cloudinary public_id will include the folder name.
    const publicIdStart = imageURL.indexOf('products')
    const publicIdEnd = imageURL.lastIndexOf('.') // Get the period just before .png, .jpeg, etc.

    // This should never occur, but if it does then there's no point in continuing.
    if (publicIdStart === -1 || publicIdEnd === -1) {
      return
    }

    const publicId = imageURL.substring(publicIdStart, publicIdEnd)

    try {
      const res = await axios.post('/api/admin/cloudinary-sign', {
        // The property key must be snake case because it's spread on the
        // server side as ...req.body, and Cloudinary expects public_id.
        public_id: publicId
      })

      // At this point, data will always be { signature, timestamp }
      const { data, success } = res.data

      if (success !== true || !data) {
        return
      }

      const formData = new FormData()

      // Since we signed for 'public_id', it MUST be appended here as well.
      // Conversely, we cannot append it here without also signing for it.
      formData.append('public_id', publicId)
      formData.append('signature', data?.signature)
      formData.append('timestamp', data?.timestamp)
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_KEY)

      // https://api.cloudinary.com/v1_1/                            {{cloud_name}}                  /:resource_type/destroy
      const cloudinaryDestroyURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/destroy`
      const cloudinaryResponse = await axios.post(
        cloudinaryDestroyURL,
        formData
      )

      // At this point, the image has been destroyed in Cloudinary. It now
      // makes sense to remove the previous imageURL since it's a dead link.
      setImageURL('')
      return cloudinaryResponse
    } catch (err: any) {
      ///////////////////////////////////////////////////////////////////////////
      //
      // If an error occurs here, we can do the equivalent of rethrowing it.
      // We could throw err, but I prefer to return a rejected Promise, which
      // will also go to the catch block of any containing try/catch.
      // In this case we can either pass the err or a more generic error:
      //
      //   const errorObject = new Error('An error occurred while attempting to delete the previous product image!')
      //   return Promise.reject(errorObject)
      //
      ///////////////////////////////////////////////////////////////////////////
      return Promise.reject(err)
    }
  }

  /* ======================
    handleImageUpdate()
  ====================== */
  ///////////////////////////////////////////////////////////////////////////
  //
  // This function is called by the onChange of the <input type='file>.
  // This function handles the image upload to Cloudinary. In this implementation
  // the image is FIRST being added to Cloudinary from the client side and SECOND
  // the imageURL is being updated on the associated product document in the
  // database.
  //
  // Generally, I prefer sending image data with the rest of the data as a dataURL,
  // then handling all Cloudinary logic on the server side. That said, this is
  // another way of doing it...
  //
  ///////////////////////////////////////////////////////////////////////////

  const handleImageUpdate = async (e: any) => {
    const file = e?.target?.files![0]

    if (!file || !productId) {
      return
    }

    if (updatingImage === true) {
      return
    }

    //# Validate file type, size, etc.
    //# In particular, I would only allow .jpeg, jpg, and .png.

    setUpdatingImage(true)

    try {
      // Step 1: If there is a previous imageURL, then destroy the associated Cloudinary image.
      // If anything goes wrong in destroyPreviousImage() it will return a rejected Promise,
      // which will then go to this catch block.
      await destroyPreviousImage()

      // Step 2: Once the previous image has been destroyed (if there was one) then generate
      // a new Cloudinary signature specifically for uploading a new product image.
      // If we're specifying a folder, it also needs to be signed for otherwise you get a 401.
      const res = await axios.post('/api/admin/cloudinary-sign', {
        folder: 'products'
      })

      const { data: data, success: success } = res.data

      if (success === true && data) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('signature', data?.signature)
        formData.append('timestamp', data?.timestamp)
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_KEY)
        // Because we signed for the folder, we also MUST include it here. Otherwise we get a 401.
        formData.append('folder', 'products')

        const cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/upload`
        const cloudinaryResponse = await axios.post(
          cloudinaryUploadURL,
          formData
        )

        ///////////////////////////////////////////////////////////////////////////
        //
        // At this point, we've updated the image in the Cloudinary products folder,
        // but we still need to make a separate PATCH request to `/api/admin/products/${productId}`
        // to update the image. We want to do this independent of the other form data. Why?
        // Because it's possible that the user will update the image, but then not send the form.
        //
        // Of course, an entirely different approach would entail sending a dataURL to the server
        // along with all the other JSON form data. Then we could handle the Cloudinary logic from
        // the server side. That's my preferred approach, but that's not what we're doing in this version.
        //
        ///////////////////////////////////////////////////////////////////////////

        // Step 3: Make independent call to server to update the image value.
        const newImageURL = cloudinaryResponse?.data?.secure_url
        if (!newImageURL) {
          throw new Error('The image upload failed! Missing secure_url!')
        }

        const requestData = {
          image: newImageURL
        }

        axios
          .patch(`/api/admin/products/${productId}`, requestData)

          .then((_res: any) => {
            setImageURL(newImageURL)
            toast.success('Image updated successfully!')
          })

          .catch((err: any) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Image upload error:', err)
              toast.error(err.message)
            } else {
              toast.error('Unable to update product image!')
            }
          })
        // .finally(() => {})
      }

      setUpdatingImage(false)
    } catch (err: any) {
      setUpdatingImage(false)

      if (process.env.NODE_ENV === 'development') {
        console.log('Image upload error:', err)
        toast.error(err.message)
      } else {
        toast.error('The image upload failed!')
      }
    }
  }

  /* ======================
      handleSubmit()
  ====================== */

  const handleSubmit = () => {
    // Validation...
    if (
      name.trim() === '' ||
      price.trim() === '' ||
      category.trim() === '' ||
      brand.trim() === '' ||
      countInStock.trim() === '' ||
      description.trim() === ''
    ) {
      toast.error('Please complete all required fields!')
      return
    }

    setUpdatingProduct(true)

    const requestData = {
      name,
      price: parseFloat(price),
      category,
      brand,
      countInStock: parseInt(countInStock),
      description
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    // The underlying request is handled as a PATCH. This is useful so that it can
    // be used to send partial updates. For example, the image upload logic only
    // sends the image data.
    //
    // That said, all values in this form are still required. Otherwise, it might be
    // confusing to the user if they delete a value, and then it's not actually deleted.
    //  For that reason, it's best to explicitly indicate that all values are required.
    //
    ///////////////////////////////////////////////////////////////////////////

    axios
      .patch(`/api/admin/products/${productId}`, requestData)

      .then((_res: any) => {
        toast.success('Product updated successfully')
        router.push('/admin/products')
      })

      .catch((_err: any) => {
        toast.error('Unable to update product!')
      })

      .finally(() => {
        setUpdatingProduct(false)
      })
  }

  /* ======================
      renderProductForm()
  ====================== */

  const renderProductForm = () => {
    // There's no need to check an error or loading state since product is
    // passed in as a prop. That said, product may potentially be null, so
    // we do need to check for that.
    if (!product) {
      return (
        <div className='alert alert-danger border-danger rounded-3 shadow-sm'>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            style={{ marginRight: 5 }}
          />{' '}
          Unable to get product!
        </div>
      )
    }

    // Otherwise render product form.
    return (
      <div
        className='d-flex flex-column flex-xl-row align-items-center align-items-xl-stretch'
        style={{
          gap: 25
        }}
      >
        {/* =====================
        Quasi Image Upload Form
        ===================== */}

        <section
          className='p-3 border border-primary rounded-3'
          style={{
            backgroundColor: '#fafafa',
            maxWidth: 800,
            width: '100%'
          }}
        >
          <div className='mb-3'>
            <label
              className='form-label'
              htmlFor='imageFile'
              style={{
                fontSize: 20
              }}
            >
              Select Image:
            </label>

            <input
              accept='image/png, image/jpeg, image/jpg'
              className='visually-hidden'
              disabled={updatingImage}
              id='imageFile'
              onChange={handleImageUpdate}
              ref={imageInputRef}
              type='file'
              // Generally, type='file' has no value because it's uncontrolled.
            />

            <div className='form-text' style={{ fontSize: 14 }}>
              <strong>Note:</strong> Updating the product image occurs
              independently from the update for other product data. Thus,
              changing the image here will immediately affect the product's
              image regardless of whether or not the form below is submitted.
            </div>
          </div>

          {/* The nice thing about this implementation is that image previews are super simple.
          That said, a product create page will need to use a different approach. Why? 
          Because the product document needs to be created BEFORE or at the same time as
          the image is created. Again, this is why using the dataURL approach is preferable. */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              onClick={() => {
                if (imageInputRef.current === null) {
                  return
                }

                // Note: The actual input is disabled when updatingImage === true.
                // In that case, .click() will also do nothing.
                imageInputRef.current.click()
              }}
              role='button'
              style={{ cursor: 'pointer' }}
              tabIndex={0}
            >
              {imageURL ? (
                <img
                  alt=''
                  className='shadow-sm'
                  src={imageURL}
                  style={{
                    display: 'block',
                    width: 350,
                    border: '1px solid #333',
                    borderRadius: 5
                  }}
                />
              ) : (
                <div
                  className='shadow-sm'
                  style={{
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    color: '#aaa',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 350,
                    justifyContent: 'center',
                    width: 350
                  }}
                >
                  <svg
                    width='100'
                    height='100'
                    fill='currentColor'
                    viewBox='0 0 16 16'
                    style={{ margin: '-10px 0' }}
                  >
                    <path d='M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z' />
                    <path d='M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z' />
                  </svg>

                  <div className='fw-bold small'>Add An Image</div>
                </div>
              )}
            </div>
          </div>

          {updatingImage && (
            <div
              className='d-flex justify-content-center text-success fw-bold small'
              style={{ lineHeight: 1, marginTop: 15 }}
            >
              <span
                aria-hidden='true'
                className='spinner-border spinner-border-sm me-1'
                role='status'
                style={{ height: '0.75rem', width: '0.75rem' }}
              ></span>
              Updating Image....
            </div>
          )}

          <div
            style={{
              color: 'rgb(108, 117, 125)',
              fontSize: 12,
              marginTop: 15,
              // Gotcha: a value of 'break-word' will still cause the section to stretch
              // beyond half of the <section>'s parent container. However, at xl and beyond
              // we want the <section> to only take up half the horizontalspace, with the
              // form taking up the other half of the space.
              overflowWrap: 'anywhere',
              textAlign: 'center'
            }}
          >
            <strong>Image URL:</strong> {imageURL ? imageURL : '...'}
          </div>
        </section>

        {/* =====================
        Product Form (NOT including image data)
        ===================== */}

        <form
          className='p-3 border border-primary rounded-3'
          style={{
            backgroundColor: '#fafafa',
            maxWidth: 800,
            width: '100%'
          }}
        >
          <div className='mb-3'>
            <label className='form-label' htmlFor='name'>
              Name <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='name'
              onChange={(e) => {
                setName(e.target.value)
              }}
              type='text'
              value={name}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='price'>
              Price <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='price'
              onChange={(e) => {
                setPrice(e.target.value)
              }}
              min={0}
              type='number'
              value={price}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='category'>
              Category <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='category'
              onChange={(e) => {
                setCategory(e.target.value)
              }}
              type='text'
              value={category}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='brand'>
              Brand <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='brand'
              onChange={(e) => {
                setBrand(e.target.value)
              }}
              type='text'
              value={brand}
            />
          </div>
          <div className='mb-3'>
            <label className='form-label' htmlFor='countInStock'>
              Count In Stock <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='countInStock'
              onChange={(e) => {
                setCountInStock(e.target.value)
              }}
              min={0}
              type='number'
              value={countInStock}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='countInStock'>
              Description <sup className='text-danger'>*</sup>
            </label>
            <input
              autoComplete='off'
              className='form-control form-control-sm'
              id='description'
              onChange={(e) => {
                setDescription(e.target.value)
              }}
              type='text'
              value={description}
            />
          </div>

          {updatingProduct ? (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block w-100'
              type='button'
              disabled
            >
              <span
                className='spinner-border spinner-border-sm me-2'
                role='status'
                aria-hidden='true'
              ></span>
              Updating Product...
            </button>
          ) : (
            <button
              className='btn btn-secondary btn-sm fw-bold d-block w-100'
              onClick={handleSubmit}
              type='button'
            >
              Update Product
            </button>
          )}
        </form>
      </div>
    )
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Admin Product</title>
        <meta name='description' content='Admin Product' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <CartoonFont style={{ margin: '25px auto', textAlign: 'center' }}>
          Admin Product {productId}
        </CartoonFont>

        {/* This <section> implements a scrollable container around the btn-group. */}
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

        {renderProductForm()}
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
        permanent: false
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

  const { productId } = context.query

  // If authorized, then get data from database.
  try {
    await connectDB()

    let product = await Product.findById(productId).lean().exec()

    if (!product) {
      return {
        props: {
          product: null
        }
      }
    }

    product = JSON.parse(JSON.stringify(product))

    return {
      props: {
        product: product
      }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }

    return {
      props: {
        product: null
      }
    }
  }
}

export default AdminProductPage
