import { Icon, Icons, Robots } from "next/dist/lib/metadata/types/metadata-types";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";

export const icons: Icons = {
	icon: [16, 32, 96].flatMap((size) =>
		["light", "dark"].map(
			(type) =>
				({
					url: `/icons/${type}/favicon-${size}x${size}.png`,
					type: "image/png",
					sizes: `${size}x${size}`,
					media: `(prefers-color-scheme: ${type})`,
				} as Icon)
		)
	),
	shortcut: ["/shortcut-icon.png"],
	apple: [57, 60, 72, 76, 114, 120, 144, 152, 180].flatMap((size) =>
		["light", "dark"].map(
			(type) =>
				({
					url: `/icons/${type}/apple-icon-${size}x${size}.png`,
					type: "image/png",
					sizes: `${size}x${size}`,
					media: `(prefers-color-scheme: ${type})`,
				} as Icon)
		)
	),
	other: [
		{
			rel: "apple-touch-icon-precomposed",
			url: "/apple-touch-icon-precomposed.png",
		},
	],
};

export const og: OpenGraph = {
	title: "GateKeeper",
	description: "Sell Tickets online for free!",
	siteName: "GateKeeper",
	url: process.env.NEXT_PUBLIC_PUBLIC_URL,
	images: [],
	locale: "de_DE",
	type: "website",
};

export const robots: Robots = {
	index: false,
	follow: true,
	nocache: true,
	googleBot: {
		index: true,
		follow: false,
		noimageindex: true,
		"max-video-preview": -1,
		"max-image-preview": "large",
		"max-snippet": -1,
	},
};

export const twitter: Twitter = {
	card: "summary",
	title: "GateKeeper",
	description: "Sell Tickets online for free!",
	creator: "Alexander Rebello", // Must be an absolute URL
};

export const keywords: string[] = [
	"event management",
	"ticket sales",
	"event tickets",
	"online ticketing",
	"event planning",
	"event promotion",
	"event organization",
	"ticket booking",
	"event registration",
	"event marketing",
	"event platform",
	"event hosting",
	"event scheduling",
	"event coordination",
	"event calendar",
	"sell tickets online",
	"buy event tickets",
	"event ticket marketplace",
	"event ticketing system",
	"event ticket sales",
	"event ticket management",
	"event ticket shop",
	"customizable events",
	"event customization",
	"admin panel",
	"event administration",
	"manage events",
	"create events",
	"event creation",
	"event dashboard",
	"event analytics",
	"event reporting",
	"event customization options",
	"event customization tools",
	"personalized events",
	"event branding",
	"event website customization",
	"event SEO",
	"SEO for events",
	"event discovery",
	"event search",
	"event marketplace",
	"event organizer",
	"event host",
	"event promoter",
	"event vendor",
	"event attendee",
	"event management software",
	"event technology",
	"event industry",
	"online event platform",
	"virtual event platform",
	"hybrid event platform",
	"event management solution",
	"ticket selling platform",
	"ticketing platform",
	"ticketing service",
	"event ticketing service",
	"event ticketing platform",
	"event ticketing website",
	"event ticketing app",
	"event ticketing software",
];
