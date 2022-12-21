import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import connectDB from 'utils/db'
import Product from 'models/productModel'
type Data = any

/* ========================================================================
                          getProductHandler()
======================================================================== */

export default async function getProductHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { productId } = req.query

  if (req.method !== 'GET') {
    return res
      .setHeader('Allow', ['GET'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  // Unlikely since it will be part of the URL, but just in case.
  if (!productId) {
    return res.status(400).json({
      data: null,
      message: "The 'productId' is required!",
      success: false
    })
  }

  if (!ObjectId.isValid(productId as string)) {
    return res.status(400).json({
      data: null,
      message: "The 'productId' ObjectId format is invalid!",
      success: false
    })
  }

  try {
    await connectDB()

    const product = await Product.findById(productId).lean().exec()

    if (!product) {
      return res.status(404).json({
        data: null,
        message: 'Product not found!',
        success: false
      })
    }

    return res.status(200).json({
      data: product,
      message: 'Request successful!',
      success: true
    })
  } catch (err: any) {
    return res.status(500).json({
      data: null,
      message: err?.message ? err.message : 'Request failed!',
      success: false
    })
  }
}
