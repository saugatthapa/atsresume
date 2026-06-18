import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}
  },
  async redirects() {
    return [
      {
        source: "/blog/how-to-match-resume-to-job-description",
        destination: "/blog/how-to-match-your-resume-to-a-job-description",
        permanent: true
      },
      {
        source: "/blog/how-to-improve-ats-score",
        destination: "/blog/how-to-improve-your-ats-score",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
