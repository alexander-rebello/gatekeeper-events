import Header from "@/components/navigation/admin/header";
import Footer from "@/components/navigation/admin/footer";
import Wrapper from "./wrapper";
import { AllowedPrivaleges, checkPrivaleges } from "@/auth/lucia";
import { redirect } from "next/navigation";
import prisma from "@/db/client";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const { user, session, permissions } = await checkPrivaleges(AllowedPrivaleges.USER, true);

	if (!session) redirect("/login");

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
		<Wrapper currentEventToken={eventToken.token} permissions={permissions}>
			<Header name={user.firstName} />
			<main id='main' className='py-5 overflow-hidden flex-grow-1'>
				{children}
			</main>
			<Footer />
		</Wrapper>
	);
}
