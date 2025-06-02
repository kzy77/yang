const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Changed from true
  },
  typescript: {
    ignoreBuildErrors: false, // Changed from true
  },
  // serverExternalPackages: ['next'], //  Next.js 14.2.3 doesn't recognize this
};

export default nextConfig;
