import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import connectDB from 'utils/db'
import User from 'models/userModel'
type Data = any

/* ========================================================================
                            handleUpdateUser()
======================================================================== */

export default async function handleUpdateUser(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { userId, name, email, password } = req.body

  // Check HTTP method.
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

  // Return early if no userId. All other properties are optional.
  if (!userId) {
    return res.status(400).json({
      data: null,
      message: "The 'userId' is required in the req.body!",
      success: false
    })
  }

  // Return early if the userId is not a valid ObjectId.
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({
      data: null,
      message: "The 'userId' ObjectId format is invalid!",
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
    // We could also return early if user is not admin or userId does not match
    // session.user.id. However, the authentication check works for now.

    await connectDB()

    // Return early if the user submitted an email and that email
    // matches a different user's email. In other words, check
    // for a potential duplicate.
    if (email) {
      // Check for potentialDuplicateUser by email. If that user
      // already exists, then return 409 error.
      const potentialDuplicateUser = await User.findOne({
        email: new RegExp(`^${email}$`, 'i')
      })
        .lean()
        .exec()

      if (
        potentialDuplicateUser &&
        potentialDuplicateUser._id.toString() !== userId
      ) {
        return res.status(409).json({
          data: null,
          message: 'A user with that email already exists!',
          success: false
        })
      }
    }

    // At this point we can get the current user by id, and update it as needed.
    const user = await User.findById(userId).exec()

    // Return early if the user document is not found.
    if (!user) {
      return res.status(404).json({
        data: null,
        message: 'User not found!',
        success: false
      })
    }

    // Conditionally add the req.body values...
    if (name) {
      user.name = name
    }

    if (email) {
      user.email = email
    }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    // Save the updated user
    let updatedUser = await user.save()

    // Remove the password prior to sending it back to the client.
    updatedUser = updatedUser.toObject()
    delete updatedUser.password

    // Send the updatedUser back to the client.
    return res.status(200).json({
      data: updatedUser,
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
