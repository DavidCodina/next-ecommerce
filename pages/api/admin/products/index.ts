import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import Product from 'models/productModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                            getAdminProductsHandler()                 
======================================================================== */
// Currently, there doesn't seem to be any meaningful difference between
// the GET request used here and the one for normal users. That said,
// it may still be useful to have one specifically dedicated for admins
// should that change in the future...

const getAdminProductsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  // Here we're checking that req.method is either GET or POST
  if (['GET', 'POST'].indexOf(req.method as string) === -1) {
    return res
      .setHeader('Allow', ['GET', 'POST'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  const session: any = await unstable_getServerSession(req, res, authOptions) // => session | null

  // Return early if user is unauthenticated
  if (!session) {
    return res.status(401).json({
      data: null,
      message: 'Not authorized!',
      success: false
    })
  }

  // Return early if user does not have sufficient privileges/roles
  if (
    !Array.isArray(session?.user?.roles) ||
    !session?.user?.roles.includes('admin')
  ) {
    return res.status(403).json({
      data: null,
      message: 'Forbidden!',
      success: false
    })
  }

  try {
    await connectDB()

    /* ======================
          GET Request
    ====================== */

    if (req.method === 'GET') {
      const products = await Product.find().lean().exec()

      if (!products) {
        return res.status(404).json({
          data: null,
          message: 'Request failed!',
          success: false
        })
      }

      return res.status(200).json({
        data: products,
        message: 'Request successful!',
        success: true
      })
    }

    /* ======================
          POST Request
    ====================== */
    // This was done in Basir Udemy tutorial video 35 at 4:45.
    // This is a kind of hacky way to create a product. Basically, we are creating a
    // dummy product. Once created, we can then update it from /admin/product/[productId].
    // While this works for now, it's a bad practice to leave in place. Instead, we
    // need to implement a CreatePostPage.

    if (req.method === 'POST') {
      const newProduct = new Product({
        name: 'sample name',
        image: '/images/image-not-available.png',
        price: 0,
        category: 'sample category',
        brand: 'sample brand',
        countInStock: 0,
        description: 'sample description',
        rating: 0,
        numReviews: 0
      })

      const product = await newProduct.save()

      return res.status(201).json({
        data: product,
        message: 'Request successful!',
        success: true
      })
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }

    return res.status(500).json({
      data: null,
      message: err?.message ? err.message : 'Request failed!',
      success: false
    })
  }
}

export default getAdminProductsHandler
