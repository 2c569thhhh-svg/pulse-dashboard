/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.scdn.co', 'mosaic.scdn.co'],
  },
  // Reduce memory usage during build
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
}

module.exports = nextConfig
