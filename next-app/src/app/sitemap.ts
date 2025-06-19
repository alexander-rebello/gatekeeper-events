import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	const base = process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
	return [
		{
			url: base + "/",
			lastModified: now,
			priority: 1.0,
		},
		{
			url: base + "/login",
			lastModified: now,
			priority: 0.8,
		},
		{
			url: base + "/signup",
			lastModified: now,
			priority: 0.6,
		},
		{
			url: base + "/reset-password",
			lastModified: now,
			priority: 0.4,
		},
		{
			url: base + "/datenschutz",
			lastModified: now,
			priority: 0.3,
		},
		{
			url: base + "/impressum",
			lastModified: now,
			priority: 0.2,
		},
	];
}
