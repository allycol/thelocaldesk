import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Custom server.js (required for GoDaddy's PORT/0.0.0.0 binding) still uses
  // Next's own request handler, so no `output` mode override is needed here.

  // GoDaddy's Preview environment serves the app through a proxy on
  // *.airoapp.ai rather than the dev server's own origin, which Next's dev
  // server blocks by default (see Next.js `allowedDevOrigins`).
  allowedDevOrigins: ['*.airoapp.ai'],
};

export default nextConfig;
