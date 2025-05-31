const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // serverExternalPackages: ['next'], //  Next.js 14.2.3 doesn't recognize this
};

export default nextConfig;
