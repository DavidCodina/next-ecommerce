import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'

import Order from 'models/orderModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                              placeOrderHandler()                 
======================================================================== */

const placeOrderHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method !== 'POST') {
    return res
      .setHeader('Allow', ['POST'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  const {
    itemsPrice,
    orderItems,
    paymentMethod,
    shippingAddress,
    shippingPrice,
    taxPrice,
    totalPrice
  } = req.body

  //# Validation...

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

    const newOrder = new Order({
      user: session?.user?.id,
      itemsPrice,
      orderItems,
      paymentMethod,
      shippingAddress,
      shippingPrice,
      taxPrice,
      totalPrice
    })

    const savedOrder = await newOrder.save()

    return res.status(201).json({
      data: savedOrder,
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

export default placeOrderHandler
