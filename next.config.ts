import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async redirects() {
    return [
      // www -> apex (canonical sur le domaine nu)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.messidor-patrimoine.com" }],
        destination: "https://messidor-patrimoine.com/:path*",
        permanent: true,
      },
      // anciennes URLs dashboard -> nouvelles URLs publiques
      { source: "/dashboard/opcvm", destination: "/opcvm", permanent: true },
      { source: "/dashboard/opcvm/comparateur", destination: "/opcvm/comparateur", permanent: true },
      { source: "/dashboard/opcvm/:slug", destination: "/opcvm/:slug", permanent: true },
      { source: "/dashboard/opci", destination: "/opci", permanent: true },
      { source: "/dashboard/simulateur", destination: "/simulateurs", permanent: true },
      { source: "/dashboard/bourse", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/espace-client", permanent: true },
      { source: "/services", destination: "/gestion-de-patrimoine", permanent: true },
      { source: "/login", destination: "/espace-client/connexion", permanent: true },
      { source: "/signup", destination: "/espace-client/inscription", permanent: true },
    ];
  },
};

export default nextConfig;
