/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: remove when eslint is upgraded in next.js latest version
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = nextConfig
