import { validateRequest } from "@/auth/lucia";
import CopyToClipboardBtn from "@/components/forms/CopyToClipboardBtn";
import PageLayout from "@/components/navigation/admin/page-layout";
import prisma from "@/db/client";
import { redirect } from "next/navigation";

export default async function Layout({ children, statistics, chart, list }: { children: React.ReactNode; statistics: React.ReactNode; chart: React.ReactNode; list: React.ReactNode }) {
	const { session } = await validateRequest(false);

	if (session === null) redirect("/login");
	if (session.currentEventId === null) redirect("/admin/events");

	const eventToken = await prisma.event.findUnique({
		where: {
			id: session.currentEventId,
		},
		select: {
			token: true,
		},
	});

	if (eventToken === null) redirect("/admin/events");

	return (
		<PageLayout title='Dashboard' action={<CopyToClipboardBtn text={(process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000") + "/e/" + eventToken.token} />}>
			{statistics}
			{chart}
			{list}
			{children}
		</PageLayout>
	);
}
