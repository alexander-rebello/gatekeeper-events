import { validateRequest } from "@/auth/lucia";
import PageLayout from "@/components/navigation/admin/page-layout";
import { formatDate } from "@/components/utils";
import prisma from "@/db/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import ChooseEventForm, { Event } from "./form";

export default async function Events() {
	const { user, session } = await validateRequest(true);

	if (!session) redirect("/login");

	const result = await prisma.event.findMany({
		where: {
			OR: [
				{
					owner_id: user.id,
				},
				{
					user_event_roles: {
						some: {
							user_id: user.id,
						},
					},
				},
			],
		},
		select: {
			id: true,
			owner: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
				},
			},
			organizer: true,
			uuid: true,
			name: true,
			main_image: true,
			short_description: true,
			start_date: true,
			location: true,
			status: {
				select: {
					value: true,
				},
			},
		},
		orderBy: [
			{
				status_id: "asc",
			},
			{
				created_at: "desc",
			},
		],
	});

	const events: Event[] = result.map((event) => {
		return {
			id: event.id,
			owner:
				event.owner.id === user.id
					? true
					: {
							firstName: event.owner.first_name,
							lastName: event.owner.last_name,
					  },
			uuid: event.uuid,
			name: event.name,
			mainImage: event.main_image,
			shortDescription: event.short_description,
			startDate: event.start_date,
			location: event.location,
			status: event.status.value,
		};
	});

	return (
		<PageLayout
			title='Your Events'
			action={
				<Link href='/admin/events/new' className='btn btn-primary'>
					New Event
				</Link>
			}
		>
			<div className='col-12'>
				<ChooseEventForm events={events} currentEventId={session.currentEventId} />
			</div>
		</PageLayout>
	);
}
