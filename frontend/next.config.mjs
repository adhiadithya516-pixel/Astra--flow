/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${process.env.WS_URL || 'http://localhost:3001'}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
