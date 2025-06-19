import PageLayout from "@/components/navigation/admin/page-layout";
import Link from "next/link";
import LayoutTitle from "./layout-title";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewTicketTypes")) redirect("/admin/overview");

	return (
		<PageLayout
			title={<LayoutTitle />}
			action={
				<Link href='/admin/tickets/new' className='btn btn-primary'>
					New Ticket
				</Link>
			}
		>
			{modal}
			{children}
		</PageLayout>
	);
}
