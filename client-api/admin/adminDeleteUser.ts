import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            adminDeleteUser()                 
======================================================================== */

export const adminDeleteUser = async (userId: string) => {
  try {
    // Note that if we're using other login providers (besides 'credentials')
    // through NextAuth that NextAuth will also add an accounts collection
    // for each Google/GitHub/etc. user. Thus when deleting a user we would
    // also need to find the associated accounts document and remove that as well.

    const res = await axios.delete(`/api/admin/users/${userId}`)

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
