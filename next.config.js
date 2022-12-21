/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dva7tsqq3/**' // '/dva7tsqq3/image/upload/v1668712301/blogs'
      }
    ]
  }
}
