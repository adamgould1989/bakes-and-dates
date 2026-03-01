/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'bakes-and-dates.vercel.app'],
    },
  },
}

export default nextConfig
