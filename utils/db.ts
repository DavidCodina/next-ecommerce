import mongoose from 'mongoose'

/* =============================================================================
                                connectDB
============================================================================= */

const connectDB = async () => {
  let readyState = 0

  if (mongoose?.connections?.length > 0) {
    readyState = mongoose?.connections[0]?.readyState
  }

  if (readyState === 1) {
    console.log('\nA previous connection was detected. Using that.')
    // The return value of connection and the value of mongoose are the same thing.
    // Thus: connection === mongoose would be true.
    return mongoose
  }
  try {
    // Probably not really necessary, but it avoids the possibility of other
    // connections being in a readyState of 2 (connecting) or 3 (disconnecting).
    await mongoose.disconnect()

    console.log(
      '\nA previous connection was not detected. A new one is being created.'
    )
    const connection = await mongoose.connect(process.env.MONGO_URI!)
    readyState = connection?.connections[0]?.readyState
    console.log(`\nMongoDB Connected: ${connection.connection.host}.`)

    return connection
  } catch (err) {
    console.log(
      '\nMongoDB failed to connect, but the err was caught from within /utils/db.ts.'
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }
    return err
  }
}

export default connectDB
