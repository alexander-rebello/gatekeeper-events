import { validateRequest } from "@/auth/lucia";
import PageLayout from "@/components/navigation/admin/page-layout";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewOrders")) redirect("/admin/overview");

	return (
		<PageLayout
			title='Orders'
			action={
				permissions.includes("createOrders") && (
					<Link href='/admin/orders/new' className='btn btn-primary'>
						New Order
					</Link>
				)
			}
		>
			{modal}
			{children}
		</PageLayout>
	);
}
