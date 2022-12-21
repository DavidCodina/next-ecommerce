import { Schema, model, models } from 'mongoose'

/* ======================
      userSchema
====================== */

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      // unique doesn't catch case insensitivity, so david@example.com
      // and David@example.com are considered different by mongoose.
      unique: true
    },
    password: {
      type: String
      // password is not required because the user may be logging in
      // with Google, GitHub, etc. However, this means that when a user
      // logs in with email/password, we have to check that this user
      // has a password to begin with. Technically, the NextAuth adapter
      // will completely bypass the mongoose model, but it's still a
      // decent idea to make password optional to reflect the reality of
      // what is/isn't stored in the collection.
      // required: true
    },
    // image: { type: String },
    roles: {
      type: [String],
      default: ['user']
    }
    // active: {
    //   type: Boolean,
    //   default: true
    // },
  },

  { timestamps: true }
)

const User = models.User || model('User', userSchema)
export default User
