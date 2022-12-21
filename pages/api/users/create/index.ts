// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs' // Also install @types/bcryptjs
import connectDB from 'utils/db'
import User from 'models/userModel'

type Data = any

/* ========================================================================
                          createUser (AKA register)
======================================================================== */
// Sometimes people put this in api/auth/register, but that's technically
// incorrect. It's more appropriate to categorize it under user endpoints.
// Other user controllers potentialy include getUsers(), getUser(),
// getCurrentUser(), updateUser(), and deleteUser().

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { name, email, password } = req.body

  ///////////////////////////////////////////////////////////////////////////
  //
  // The errors object is ONLY for errors related to form data.
  // Thus even though we may return due to some 'error', only form value
  // errors will be included in the errors object. When there are no errors,
  // instead of sending back an object, we send back null.
  //
  // Properties of the errors array should match the name of the
  // properties sent in the req.body, which (in turn) should generally
  // match those of the state values used in the assocaited component.
  //
  ///////////////////////////////////////////////////////////////////////////
  const errors: Record<string, any> = {}

  // Return early if the user used incorrect request method.
  if (req.method !== 'POST') {
    return res
      .setHeader('Allow', ['POST'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false,
        errors: null
      })
  }

  // Validate request data.
  //# Validate more strictly (especially email), but this works for now.
  if (!name || !email || !password) {
    if (!name) {
      errors.name = 'Full name is required. (Server)'
    }

    if (!email) {
      errors.email = 'Email is required. (Server)'
    }

    if (!password) {
      errors.password = 'Password is required. (Server)'
    }

    // Return early if validation fails.
    return res.status(400).json({
      data: null,
      message: 'One or more properties in the request data was invalid!',
      success: false,
      errors: errors
    })
  }

  try {
    await connectDB()

    // Check for existingUser by email.
    const existingUser = await User.findOne({
      email: new RegExp(`^${email}$`, 'i')
    })
      .lean()
      .exec()

    // Return early if a user with that email already exists
    if (existingUser) {
      errors.email = 'A user with that email already exists. (Server)'
      return res.status(409).json({
        data: null,
        message: 'Request Failed!',
        success: false,
        errors: errors
      })
    }

    // Create newUser
    const newUser = new User({ name, email, password })

    // Salt & hash the password
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(newUser.password, salt)

    // Save the newUser to the database.
    let savedUser = await newUser.save()

    // Remove the password from the user object that we are sending back to the client.
    savedUser = savedUser.toObject()
    delete savedUser.password

    // 12. Send the new savedUser back to the client with status 201.
    return res.status(201).json({
      data: savedUser,
      message: 'Request successful!',
      success: true,
      errors: null
    })
  } catch (err: any) {
    return res.status(500).json({
      data: null,
      message: err?.message ? err.message : 'Request failed!',
      success: false,
      errors: null
    })
  }
}
