// Create in https://www.youtube.com/watch?v=mW09FBg4PlQ at 2:30 to configure
// lib/mongodb.ts for the NextAuth MongoDB adapter configuration.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      // https://www.youtube.com/watch?v=8DgxnOwFjAg
      // If you want to get auto completion for other environment varaibles
      // then list them here. Note that this is done manually, so the auto
      // completion does not guarantee that they exist.
      MONGO_URI: string
      NEXT_PUBLIC_CLOUDINARY_NAME: string
      NEXT_PUBLIC_CLOUDINARY_KEY: string
      CLOUDINARY_SECRET: string
    }
  }
}

export {}
