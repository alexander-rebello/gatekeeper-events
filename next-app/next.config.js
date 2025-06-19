/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	reactStrictMode: true,
	experimental: {
		optimizePackageImports: ["@fortawesome/fontawesome-svg-core", "@fortawesome/react-fontawesome", "@fortawesome/free-solid-svg-icons", "@fortawesome/free-brands-svg-icons", "@fortawesome/free-regular-svg-icons"],
	},
	poweredByHeader: false,
	async redirects() {
		return [
			{
				source: "/admin",
				destination: "/admin/overview",
				permanent: true,
			},
			{
				source: "/superadmin",
				destination: "/superadmin/overview",
				permanent: true,
			},
			{
				source: "/e/:slug*",
				destination: "/event/:slug*",
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.gatekeeper-events.de",
				port: "",
				pathname: "/uploads/**",
			},
		],
	},
	sassOptions: {
		quietDeps: true,
	},
	allowedDevOrigins: ["192.168.3.41"],
};

const withBundleAnalyzer = require("@next/bundle-analyzer")();

module.exports = process.env.ANALYZE === "true" ? withBundleAnalyzer(nextConfig) : nextConfig;
