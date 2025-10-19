/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable image optimization
    domains: ["firebasestorage.googleapis.com", "localhost"], // Add Firebase storage domain
  },
  // Enable performance optimizations
  experimental: {
    optimizeCss: true,
  },
  // Add compression
  compress: true,
};

export default nextConfig;
