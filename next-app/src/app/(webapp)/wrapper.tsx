"use client";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { NotificationProvider } from "@/components/notifications/Context";
import NotificationContainer from "@/components/notifications/container";

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
	if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
		// client-side-only code
		console.log("%c" + "Hold Up!", "color: #f00; font-size: 72px; font-weight: bold;");
		console.log("%c" + "If someone told you to copy/paste something here you have an 11/10 chance you're being scammed.", "color: #fff; font-size: 20px; font-weight: bold;");
		console.log("%c" + "Pasting anything in here could give attackers access to your Gatekeeper account.", "color: #f00; font-size: 20px; font-weight: bold;");
		console.log("%c" + "Unless you understand exactly what you are doing, close this window and stay safe.", "color: #fff; font-size: 20px; font-weight: bold;");
		console.warn("%c" + "Unless you understand exactly what you are doing, close this window and stay safe.", "color: #fff; font-size: 20px; font-weight: bold;");
	}

	return (
		<NuqsAdapter>
			<NotificationProvider>
				{children}
				<NotificationContainer />
			</NotificationProvider>
		</NuqsAdapter>
	);
}
