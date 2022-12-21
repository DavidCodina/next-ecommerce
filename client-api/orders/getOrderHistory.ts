import axios from 'axios'
import { getErrorMessage } from 'utils'

export const getOrderHistory = async () => {
  try {
    const res = await axios.get(`/api/orders/history`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get order history!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
