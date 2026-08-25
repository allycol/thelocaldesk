import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Custom server.js (required for GoDaddy's PORT/0.0.0.0 binding) still uses
  // Next's own request handler, so no `output` mode override is needed here.
};

export default nextConfig;
