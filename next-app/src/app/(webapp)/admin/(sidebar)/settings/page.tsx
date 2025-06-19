import PageLayout from "@/components/navigation/admin/page-layout";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";
import prisma from "@/db/client";
import { ImageUpload } from "@/components/forms/image-drop";
import ImageUploadTile from "@/components/tiles/image-upload-tile";
import { NonEmptyArray } from "@/components/utils";
import { editEventImagesAction } from "./actions";
import EventSettingsForm from "./form";
import BaseTile from "@/components/tiles/base-tile";
import Link from "next/link";

export default async function Settings() {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewSettings")) redirect("/admin/overview");

	const canEdit = permissions.includes("editSettings");

	const result = await prisma.event.findUnique({
		where: {
			id: session.currentEventId,
		},
		select: {
			status: {
				select: {
					value: true,
				},
			},
			token: true,
			name: true,
			short_description: true,
			long_description: true,
			location: true,
			start_date: true,
			end_date: true,
			sale_start_date: true,
			sale_end_date: true,
			main_image: true,
			first_image: true,
			second_image: true,
			third_image: true,
			payment_link: true,
			bank: true,
			minor_allowance: true,
			uuid: true,
		},
	});

	if (result === null) redirect("/admin/events");

	const eventSettings = {
		title: result.name,
		token: result.token,
		shortDescription: result.short_description,
		longDescription: result.long_description ?? undefined,
		location: result.location,
		eventStartDate: result.start_date,
		eventEndDate: result.end_date,
		sellStartDate: result.sale_start_date ?? undefined,
		sellEndDate: result.sale_end_date ?? undefined,
		status: result.status.value,
		paymentLink: result.payment_link ?? undefined,
		bank: result.bank ?? undefined,
		minor_allowance: result.minor_allowance,
	};

	const imageBasePath = process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/events/" + result.uuid + "/";

	const uploadIds: NonEmptyArray<ImageUpload> = [
		{
			title: "Main Image",
			id: "main_image",
			url: result?.main_image ? imageBasePath + result.main_image : undefined,
		},
		{
			title: "First Sponsor",
			id: "first_image",
			url: result?.first_image ? imageBasePath + result.first_image : undefined,
		},
		{
			title: "Second Sponsor",
			id: "second_image",
			url: result?.second_image ? imageBasePath + result.second_image : undefined,
		},
		{
			title: "Third Sponsor",
			id: "third_image",
			url: result?.third_image ? imageBasePath + result.third_image : undefined,
		},
	];

	return (
		<PageLayout title='Settings'>
			<EventSettingsForm className={"col-12 col-xl-8 col-xxl-9"} data={eventSettings} canEdit={canEdit} />

			<div className='col-12 col-xl-4 col-xxl-3'>
				<ImageUploadTile className='mb-4' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1400px) 33vw, 25vw' uploadIds={uploadIds} action={editEventImagesAction} canEdit={canEdit} />
				<BaseTile title='Delete Event'>
					{canEdit ? (
						<p className='mb-0'>
							Trying to delete an Event? For security reasons, this is not possible. Please contact the customer support: <Link href='/#contact'>Contact now</Link>
						</p>
					) : (
						<p>You don't have permission to delete this event</p>
					)}
				</BaseTile>
			</div>
		</PageLayout>
	);
}
