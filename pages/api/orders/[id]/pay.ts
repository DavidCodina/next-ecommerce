import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import Order from 'models/orderModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                                 
======================================================================== */

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== 'PUT') {
    return res
      .setHeader('Allow', ['PUT'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

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

    if (!order) {
      res.status(404).json({
        data: null,
        message: 'Order not found!',
        success: false
      })
    }

    if (order.isPaid) {
      return res.status(400).json({
        data: null,
        message: 'Error: order is already paid!',
        success: false
      })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address
    }

    const paidOrder = await order.save()

    res.status(200).json({
      data: paidOrder,
      message: 'order paid successfully',
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

export default handler
