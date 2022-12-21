import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

import Order from 'models/orderModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                              getOrderHandler()              
======================================================================== */

const getOrderHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
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

  //# Here we could also check that id is an ObjectId

  try {
    const session: any = await unstable_getServerSession(req, res, authOptions) // => session | null

    if (!session) {
      return res.status(401).json({
        data: null,
        message: 'Not authorized!',
        success: false
      })
    }

    await connectDB()

    const order = await Order.findById(req?.query?.id)

    //# Should we check for not !order ?

    return res.status(200).json({
      data: order,
      message: 'Request successful!',
      success: true
    })
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err.message)
    }

    return res.status(500).json({
      data: null,
      message: err?.message ? err.message : 'Request failed!',
      success: false
    })
  }
}

export default getOrderHandler
