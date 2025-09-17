// /** @type {import('next').NextConfig} */
// const nextConfig = {

//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   experimental: {
//     turbopack: {
//       root: __dirname,
//     },
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove turbopack for production (not stable)
  // experimental: {
  //   turbopack: {
  //     root: __dirname,
  //   },
  // },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Production optimizations
  swcMinify: true,
  
  // Environment-specific config
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // API routes timeout (for Vercel)
  serverRuntimeConfig: {
    maxDuration: 10,
  },
  
  // CORS headers for API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;