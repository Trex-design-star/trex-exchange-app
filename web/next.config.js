/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/backend/:path*', destination: `${process.env.API_URL ?? 'http://localhost:3001'}/api/:path*` }];
  },
};
module.exports = nextConfig;
