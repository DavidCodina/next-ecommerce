import axios from 'axios'
import { getErrorMessage } from 'utils'

export const getOrder = async (orderId: string) => {
  try {
    const res = await axios.get(`/api/orders/${orderId}`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get order!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
