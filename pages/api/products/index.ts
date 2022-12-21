import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from 'utils/db'

import Product from 'models/productModel'

type Data = any

/* ========================================================================
                              getProducts()
======================================================================== */
// /api routes should only be used for three cases:
//
//   1. Client-side API calls.
//   2. Open APIs
//   3. Admin apps.
//
// They should NOT be used in conjunction with getServerSideProp. Why?
// Because that results in a redundant call to the server

export default async function getProducts(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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

  try {
    await connectDB()

    const products = await Product.find().lean().exec()

    // If we're connecting to MongoDB through mongoose, then even if there were
    // no products it would still return []. That said, this is still a good practice.
    if (!products) {
      return res.status(404).json({
        data: null,
        message: 'Products not found!',
        success: false
      })
    }

    return res.status(200).json({
      data: products,
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
