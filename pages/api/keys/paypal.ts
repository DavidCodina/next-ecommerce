import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
type Data = any

/* ========================================================================
                          getPayPalClientIdHandler()
======================================================================== */
// This function can be used to get the PayPal key when [orderId].tsx mounts.
// This endpoint is hit from the client-side. The idea is to prevent the end user
// from having access to the API key. That said, the key is still exposed to anyone
// who checks the network request. Thus, I don't really see how this is approach
// is any more secure. For that reason, I'm going to instead just make the call
// from getServerSideProps of [orderId].tsx

const getPayPalClientIdHandler = async (
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

  try {
    const session: any = await unstable_getServerSession(req, res, authOptions) // => session | null

    if (!session) {
      return res.status(401).json({
        data: null,
        message: 'Not authorized!',
        success: false
      })
    }

    return res.status(200).json({
      data: process.env.PAYPAL_CLIENT_ID,
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

export default getPayPalClientIdHandler
