/** @type {import('next').NextConfig} */
const nextConfig = {
  // Currently these sign-in & sign-outs do exist, but they are at api/auth/kindeAuth
  // So we change the way the hover over looks, so the user doesn't see api/auth/kindeAuth and just sign-in
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/api/auth/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/api/auth/register',
        permanent: true,
      },
      {
        source: '/sign-out',
        destination: '/api/auth/logout',
        permanent: true,
      }
    ]
  },

  // Config settings for react-pdf worker
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },



};

export default nextConfig;
