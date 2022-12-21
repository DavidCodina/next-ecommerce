import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import Order from 'models/orderModel'
import connectDB from 'utils/db'

type Data = any

/* ========================================================================
                              getAdminOrdersHandler()                 
======================================================================== */

const getAdminOrdersHandler = async (
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

    const orders = await Order.find().populate('user', 'name')

    return res.status(200).json({
      data: orders,
      message: 'Request successful!',
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

export default getAdminOrdersHandler
