import axios from 'axios'
import { getErrorMessage } from 'utils'

export const getProduct = async (productId: string) => {
  try {
    const res = await axios.get(`/api/products/${productId}`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get product'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
