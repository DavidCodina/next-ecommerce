import Product from 'models/productModel'
import connectDB from 'utils/db'
import data from './data'

const productsWithNoIds = data.products.map((product: any) => {
  delete product._id
  return product
})

/* =============================================================================

============================================================================= */
// This should be added to the .gitignore
// Note that the image property will still point at
// URLs that are assumed to be in the public folder

const handler = async (req: any, res: any) => {
  try {
    const connection: any = await connectDB()
    await Product.deleteMany()
    await Product.insertMany(productsWithNoIds)
    await connection.disconnect()

    res.status(200).json({
      data: productsWithNoIds,
      message: 'Seeded successfully',
      success: true
    })
  } catch (err: any) {
    console.log(err)
    res.status(500).json({
      data: null,
      message: err.message || 'Seeding failed',
      success: false
    })
  }
}

export default handler
