import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                        
======================================================================== */
// This function can be used to get the PayPal key when [orderId].tsx mounts.
// In theory, we could get the key from getServerSideProps() then pass it into
// [orderId].tsx as a prop. I don't know how this is any better. Technically,
// the key is still obvious to anyone who checks the network request.

export const getPaypalKey = async () => {
  try {
    const res = await axios.get('/api/keys/paypal')

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get PayPal key.'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
