import { useRouter } from 'next/router'

// interface IProductItem {
//   handleAddToCart: (product: any) => void
//   product: any
// }

/* ========================================================================
                                ProductItem 
======================================================================== */

export const ProductItem = ({ product, handleAddToCart }) => {
  const router = useRouter()

  /* ======================
          return 
  ====================== */

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: 10,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        width: 'auto'
      }}
    >
      <img
        alt={product.name}
        onClick={() => router.push(`/product/${product._id}`)}
        src={product.image}
        style={{ cursor: 'pointer', display: 'block', width: '100%' }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 5
        }}
      >
        <h3
          className='text-center text-primary fw-bold'
          onClick={() => router.push(`/product/${product._id}`)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>

        <p style={{ fontSize: 14, marginBottom: 10 }}>
          <strong>Brand:</strong> {product.brand}
        </p>

        <p style={{ fontSize: 14, marginBottom: 10 }}>
          <strong>Price:</strong> ${product.price}
        </p>

        <p style={{ fontSize: 14, marginBottom: 10 }}>
          <strong>Rating:</strong> {product.rating} out of 5
        </p>

        <button
          className='btn btn-secondary btn-sm fw-bold'
          onClick={() => handleAddToCart(product)}
        >
          Add To Cart
        </button>
      </div>
    </div>
  )
}
