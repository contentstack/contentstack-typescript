/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure SDK is properly handled
  transpilePackages: ['@contentstack/delivery-sdk'],
  // Test both server and client bundles
  webpack: (config, { isServer }) => {
    // Ensure JSON files are handled
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
};

module.exports = nextConfig;

