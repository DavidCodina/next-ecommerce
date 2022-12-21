// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from 'mongodb'

/* =============================================================================

============================================================================= */
////////////////////////////////////////////////////////////////////////////////
//
// This file is a modified version of the example provided by:  https://next-auth.js.org/adapters/mongodb
// This version is instead based off of the following tutorial: https://www.youtube.com/watch?v=mW09FBg4PlQ
// In that tutorial we also created a global.d.ts file that looks like this:
//
//   declare global {
//     namespace NodeJS {
//       interface ProcessEnv {
//         NODE_ENV: 'development' | 'production'
//       }
//     }
//   }
//
//   export {}
//
////////////////////////////////////////////////////////////////////////////////

const connectionString = process.env.MONGO_URI!

if (!connectionString) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).

  const globalWithMongoClientPromise = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>
  }

  if (!globalWithMongoClientPromise._mongoClientPromise) {
    client = new MongoClient(connectionString, options)
    globalWithMongoClientPromise._mongoClientPromise = client.connect()
  }

  clientPromise = globalWithMongoClientPromise._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(connectionString, options)
  clientPromise = client.connect()
}

export default clientPromise
