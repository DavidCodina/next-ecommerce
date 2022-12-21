import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'

import User from 'models/userModel'
import connectDB from 'utils/db'
type Data = any

/* ========================================================================
                                handler()                 
======================================================================== */

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // Return early if request uses prohibited method.
  if (['DELETE'].indexOf(req.method as string) === -1) {
    return res
      .setHeader('Allow', ['DELETE'])
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

  const userId = req?.query?.userId

  if (!ObjectId.isValid(userId as string)) {
    return res.status(400).json({
      data: null,
      message: 'The userId ObjectId format is invalid!',
      success: false
    })
  }

  try {
    await connectDB()

    const user = await User.findById(userId).exec()

    if (!user) {
      return res.status(404).json({
        data: null,
        message: 'User not found!',
        success: false
      })
    }

    if (user?.roles?.includes('admin')) {
      return res.status(400).json({
        data: null,
        message:
          "Admins can't be deleted through this endpoint. Please contact the dev team or database administrator!",
        success: false
      })
    }

    // Or use await user.deleteOne()
    const result = await user.remove()

    res.status(200).json({
      data: null,
      message: `The user ${result.name} with an id of ${result._id} has been deleted.`,
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

export default handler
