/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  transpilePackages: [
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana/wallet-adapter-base'
  ]
}

module.exports = nextConfig 