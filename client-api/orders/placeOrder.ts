import axios from 'axios'
import { getErrorMessage } from 'utils'

export const placeOrder = async (requestData: any) => {
  try {
    const res = await axios.post(`/api/orders`, requestData)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to place order!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
