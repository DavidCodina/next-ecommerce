import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            deleteUser()
======================================================================== */
// The '/api/users/delete' endpoint will check the current user's session.user.id,
// and delete themself. Using '/api/users/delete' is not really following REST
// conventions. We should instead be using just '/api/users'. The fact that it's
// a DELETE request is sufficient for differntiating.

export const deleteUser = async () => {
  try {
    const res = await axios.delete(`/api/users/delete`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to delete user!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
