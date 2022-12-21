import axios from 'axios'
import { getErrorMessage } from 'utils'

export const createUser = async (requestData: any) => {
  try {
    const res = await axios.post(`/api/users/create`, requestData)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to create new user!'),
      status: err?.response?.status || 500,
      success: false,
      // For endpoints that receive form values, an errors object is generally
      // also sent back. This can be picked off of the axios response as follows:
      errors: err?.response?.data?.errors || null
    })
  }
}
