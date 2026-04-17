/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for Electron
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  trailingSlash: true,
}

export default nextConfig
