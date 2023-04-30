/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "10.17.50.106",
            },
        ],
    },
};

module.exports = nextConfig;
