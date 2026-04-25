/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "e-com.incrix.com",
            port: "",
            pathname: "/**",
          },
          
        ],
        unoptimized: true,
      },
};

export default nextConfig;
