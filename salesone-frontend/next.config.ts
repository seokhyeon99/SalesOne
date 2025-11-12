/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8003/api/:path*',
      },
    ];
  },
  reactStrictMode: false,
  devIndicators: {
    appIsrStatus: false,
    buildIndicator: false,
    pprStatus: false,
    routerStatus: false,
    serverStatus: false,
    workerStatus: false,
  },
  onDemandEntries: {
    // This disables the keep alive ping
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 