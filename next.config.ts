/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['i.pravatar.cc',  'ztqcabyezfmjnewfyoav.supabase.co',],// ✅ Add this line

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ztqcabyezfmjnewfyoav.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],

  },
};

export default nextConfig;