import axios from 'axios'
import { getErrorMessage } from 'utils'

export const updateUser = async (requestData: any) => {
  try {
    const res = await axios.patch(`/api/users/update`, requestData)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to update user!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
