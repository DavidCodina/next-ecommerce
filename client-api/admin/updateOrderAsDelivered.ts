import axios from 'axios'
import { getErrorMessage } from 'utils'

export const updateOrderAsDelivered = async (orderId: string) => {
  try {
    const res = await axios.patch(`/api/admin/orders/${orderId}/deliver`, {})

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
