import type { NextConfig } from "next";

import { securityHeaders } from "./lib/config/securityHeaders";

const nextConfig: NextConfig = {
  // Ne pas annoncer la technologie du serveur (« X-Powered-By: Next.js »).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders() }];
  },
};

export default nextConfig;
