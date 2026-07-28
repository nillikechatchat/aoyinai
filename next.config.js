/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  experimental: {
    allowedHosts: ['.monkeycode-ai.online']
  }
}

module.exports = nextConfig
