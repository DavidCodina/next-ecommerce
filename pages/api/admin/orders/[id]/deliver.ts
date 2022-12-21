import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import Order from 'models/orderModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                      updateDeliveryToTrueHandler()             
======================================================================== */

const updateDeliveryToTrueHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method !== 'PATCH') {
    return res
      .setHeader('Allow', ['PATCH'])
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

    const order = await Order.findById(req?.query?.id)

    if (!order) {
      return res.status(404).json({
        data: null,
        message: 'Order not found!',
        success: false
      })
    }

    order.isDelivered = true
    order.deliveredAt = Date.now()
    const deliveredOrder = await order.save()

    return res.status(200).json({
      data: deliveredOrder,
      message: 'Request successful',
      success: true
    })
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

export default updateDeliveryToTrueHandler
