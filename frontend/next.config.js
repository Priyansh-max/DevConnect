/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true }, // Optional: Keep this if you want to avoid optimized image handling
};

module.exports = nextConfig;
