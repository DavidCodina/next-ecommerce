import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import { v2 as cloudinary } from 'cloudinary'
type Data = any

/* ========================================================================
                          Cloudinary Signature                           
======================================================================== */
// With the returned signature, we can upload an image to the cloudinary server.
// The endpoint is a POST request that allows the client to pass in any additional
// properties that need to be signed for. This enables us to dynamically create
// signatures for destroying images, uploading images, etc.

const signature = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // Return early if wrong request method.
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

    // Return early if user does not have sufficient privileges/roles.
    // In some sites we may allow retailers to upload their own products
    // and product images, but in this site that is only for admins.
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

    const timestamp = Math.round(new Date().getTime() / 1000)

    const signature = cloudinary.utils.api_sign_request(
      {
        ...req.body, // e.g., folder: 'products', public_id: 'products/teqqqsj7f5eef78k1xzk', etc.
        timestamp: timestamp
      },
      process.env.CLOUDINARY_SECRET
    )

    return res.status(200).json({
      data: { signature, timestamp },
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

export default signature
