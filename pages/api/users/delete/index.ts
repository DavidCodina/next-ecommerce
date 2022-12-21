import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'
import connectDB from 'utils/db'
import User from 'models/userModel'
type Data = any

/* ========================================================================
                            handleDeleteUser()
======================================================================== */
// Note: Implementing API endpoints in this way is not the most RESTful approach.
// Technically, we should just be using a single endpoint that receives different
// request methods.

export default async function handleDeleteUser(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Check HTTP method.
  if (req.method !== 'DELETE') {
    return res
      .setHeader('Allow', ['DELETE'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  try {
    const session: any = await unstable_getServerSession(req, res, authOptions) // => session | null

    // Return early if user is unauthenticated
    if (!session) {
      return res.status(401).json({
        data: null,
        message: 'Not authorized!',
        success: false
      })
    }

    const { id: userId } = session.user

    // Return early if no userId.
    if (!userId) {
      return res.status(400).json({
        data: null,
        message: "The 'session.user.id' was not found!",
        success: false
      })
    }

    // Return early if the userId is not a valid ObjectId.
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        data: null,
        message: "The 'session.user.id' ObjectId format is invalid!",
        success: false
      })
    }

    await connectDB()

    const user = await User.findById(userId).exec()

    // Return early if the user document is not found.
    if (!user) {
      return res.status(404).json({
        data: null,
        message: 'User not found!',
        success: false
      })
    }

    // Return early if the user to be deleted is an admin.
    if (user?.roles?.includes('admin')) {
      return res.status(400).json({
        data: null,
        message:
          "Admins can't be deleted through this endpoint. Please contact the dev team or database administrator!",
        success: false
      })
    }

    //! In the case of an eCommerce site, we may also want to prevent a user
    //! from deleting themself while they have pending orders.
    const deletedUser = await user.remove() // Or use await user.deleteOne()

    // Send the deletedUser back to the client.
    return res.status(200).json({
      data: deletedUser,
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
