import bcrypt from 'bcryptjs'
import connectDB from 'utils/db'
import User from 'models/userModel'
import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'
import CredentialsProvider from 'next-auth/providers/credentials'

/* =============================================================================
                                authOptions
============================================================================= */
// This is exported here, so it can be passed into unstable_getServerSession() elsewhere.

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 // 1 hour //# test this by setting it lower and seeing what happens.
  },

  callbacks: {
    signIn: async (/* { user, account, profile, email, credentials } */) => {
      return true
    },
    jwt: async ({ token, user /* account, profile, isNewUser*/ }) => {
      const email = user?.email || ''

      if (email) {
        await connectDB()
        const dbUser = await User.findOne({ email }).lean().exec()

        // Add id (MongoDB ObjectId string) property to token. Note: It will already have
        // it the MongoDB ObjectId string as the token.sub, but for semantic reasons I
        // also like to inlcude it as id.
        if (dbUser) {
          if (dbUser?._id) {
            token.id = dbUser._id.toString()
          }

          // Add default roles to the token.
          if (dbUser?.roles) {
            token.roles = dbUser.roles || ['user']
          }
        }
      }
      return token
    },

    session: async ({ session, token /*, user */ }) => {
      const updatedSession: any = session
      if (token) {
        if (token.id) {
          updatedSession.user.id = token.id
        }

        if (token.roles) {
          updatedSession.user.roles = token.roles
        }

        // Omitting the image property from the profile() callbacks will not prevent NextAuth
        // from trying to add it to the session data. Thus, if you really want to omit it you
        // have to delete the property here.
        if (updatedSession?.user?.hasOwnProperty('image')) {
          delete updatedSession.user.image
        }
      }

      // We could return updated session. It doesn't really matter since objects are referential
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
    // Should we instead set maxAge here?
  },
  pages: {
    signIn: '/login'
  },

  // debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize(credentials, _req) {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        try {
          await connectDB()
          let existingUser = await User.findOne({ email }).exec()

          if (!existingUser) {
            throw new Error('Invalid credentials. (1)')
          }

          if (!existingUser.password) {
            throw new Error('Invalid credentials. (2)')
          }

          const isMatch = await bcrypt.compare(password, existingUser.password)

          if (!isMatch) {
            throw new Error('Invalid credentials. (3)')
          }

          existingUser = existingUser.toObject()
          delete existingUser.password

          return {
            id: existingUser._id.toString(), // By default NextAuth also makes this the token.sub
            name: existingUser.name,
            email: existingUser.email
          }
        } catch (err: any) {
          throw new Error(err?.message ? err.message : 'Request failed!') // Or return null
        }
      }
    })
  ]
}

/* =============================================================================
                              NextAuth()
============================================================================= */

// After we log in successfully, next-auth will add a cookie.
// This can be seen from the dev tools application tab.
export default NextAuth(authOptions)
