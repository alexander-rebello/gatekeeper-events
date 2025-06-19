import { validateRequest } from "@/auth/lucia";
import PageLayout from "@/components/navigation/admin/page-layout";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewDiscountCodes")) redirect("/admin/overview");

	return (
		<PageLayout
			title='Discount Codes'
			action={
				permissions.includes("createDiscountCodes") && (
					<Link href='/admin/discounts/new' className='btn btn-primary'>
						New Discount Code
					</Link>
				)
			}
		>
			{modal}
			{children}
		</PageLayout>
	);
}
