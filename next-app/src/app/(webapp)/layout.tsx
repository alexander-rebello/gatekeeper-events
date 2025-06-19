import "@/fonts/Fenix.css";
import "@/fonts/Lato.css";
import "@/fonts/Moon.css";
import "@/fonts/Quantum.css";
import "@/scss/styles.scss";

import type { Metadata } from "next";
import { icons, keywords, og, robots, twitter } from "./metadata";
import SecurityWrapper from "./wrapper";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { WebVitals } from "./webvitals";
config.autoAddCss = false;

export const metadata: Metadata = {
	title: {
		default: "GateKeeper",
		template: "%s | GateKeeper",
	},
	description: "Sell Tickets online for free!",
	metadataBase: new URL("/", process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"),
	applicationName: "Gatekeeper",
	referrer: "origin-when-cross-origin",
	authors: [{ name: "Alexander Rebello", url: "https://github.com/alexander-rebello/" }],
	creator: "Alexander Rebello",
	publisher: "Alexander Rebello",
	manifest: process.env.NEXT_PUBLIC_PUBLIC_URL + "/manifest.json",
	icons: icons,
	keywords: keywords,
	robots: robots,
	openGraph: og,
	twitter: twitter,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' data-bs-theme='dark'>
			<body>
				{process.env.NODE_ENV === "development" ? <WebVitals /> : null}
				<SecurityWrapper>{children}</SecurityWrapper>
			</body>
		</html>
	);
}
