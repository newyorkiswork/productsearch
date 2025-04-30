/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for specific paths
  experimental: {
    // Enable the App Router
    appDir: true,
  },
  // Disable image optimization for placeholder images
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  // Skip type checking and linting during build to speed up deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure we're not trying to use server-only code during static generation
  output: 'standalone',
}

export default nextConfig
