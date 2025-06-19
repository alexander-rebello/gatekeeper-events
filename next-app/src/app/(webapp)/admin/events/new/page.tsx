import NewEventForm from "./form";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";
import PageLayout from "@/components/navigation/admin/page-layout";

export default async function Modal() {
	const { session } = await validateRequest(true);

	if (!session) redirect("/login");

	return (
		<PageLayout title="Create new Event">
			<div className="col-12">
				<NewEventForm />
			</div>
		</PageLayout>
	);
}
