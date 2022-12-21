import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'

import Product from 'models/productModel'
import connectDB from 'utils/db'
type Data = any

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

/* ========================================================================
                        
======================================================================== */
// This handler has a generic name because it has several functions
// depending on what the request method is.

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (['GET', 'PATCH', 'DELETE'].indexOf(req.method as string) === -1) {
    return res
      .setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  const { productId } = req.query

  // Return early if the productId is an invalid MongoDB ObjectId.
  if (!ObjectId.isValid(productId as string)) {
    return res.status(400).json({
      data: null,
      message: "The 'productId' ObjectId format is invalid!",
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

    const product = await Product.findById(productId).exec()

    if (!product) {
      return res.status(404).json({
        data: null,
        message: 'Request failed!',
        success: false
      })
    }

    /* ======================
          GET Request
    ====================== */

    if (req.method === 'GET') {
      return res.status(200).json({
        data: product,
        message: 'Request successful!',
        success: true
      })
    }

    /* ======================
          PATCH Request
    ====================== */
    // The PATCH request is used to update one or more fields on the
    // associated product document. For example, this endpoint may
    // be hit when just updating the image, or it may be hit again
    // when updating one or more other values.

    if (req.method === 'PATCH') {
      //# Validate all values as needed...

      const { name, price, category, image, brand, countInStock, description } =
        req.body

      if (name) {
        product.name = name
      }

      if (typeof price === 'number') {
        product.price = price
      }

      if (category) {
        product.category = category
      }

      // i.e., Cloudinary image URL.
      if (image) {
        product.image = image
      }

      if (brand) {
        product.brand = brand
      }

      if (typeof countInStock === 'number') {
        product.countInStock = countInStock
      }

      if (description) {
        product.description = description
      }

      const updatedProduct = await product.save()

      return res.status(200).json({
        data: updatedProduct,
        message: 'Request successful!',
        success: true
      })
    }

    /* ======================
          DELETE Request
    ====================== */

    if (req.method === 'DELETE') {
      await product.remove()

      // After deleting the product from database, delete the associated Cloudinary image (if there is one).
      // In this case, we're assuming that the image will be found in the Cloudinary products folder.
      const imageURL = product?.image
      if (imageURL && typeof imageURL === 'string') {
        const publicIdStart = imageURL.indexOf('products') // The public_id includes the folder name if there is one.
        const publicIdEnd = imageURL.lastIndexOf('.') // Get the period just before .png, .jpeg, etc.
        let publicId = ''
        if (publicIdStart !== -1 && publicIdEnd !== -1) {
          publicId = imageURL.substring(publicIdStart, publicIdEnd)
        }
        if (publicId) {
          await cloudinary.uploader.destroy(publicId)
        }
      }

      return res.status(200).json({
        data: null,
        message: 'Product Deleted!',
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

export default handler
