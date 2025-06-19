import PageLayout from "@/components/navigation/admin/page-layout";
import BaseTile from "@/components/tiles/base-tile";
import Header from "@/components/navigation/admin/header";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";
import prisma from "@/db/client";
import { editUserImageAction } from "./actions";
import UserSettingsForm from "./_forms/settingsForm";
import ImageDrop from "@/components/forms/image-drop";
import UserActionsForm from "./_forms/actionsForm";
import PasswordForm from "./_forms/passwordForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "User Settings",
	};
}

export type UserSettings = {
	firstName: string;
	lastName: string;
	email: string;
	createdAt: Date;
	status: string;
};

export default async function Profile() {
	const { user, session } = await validateRequest(true);

	if (!session) redirect("/login");

	let result;
	try {
		result = await prisma.user.findUnique({
			where: {
				id: user.id,
			},
			select: {
				created_at: true,
				first_name: true,
				last_name: true,
				email: true,
				image: true,
				status: {
					select: {
						value: true,
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
	}

	if (!result) redirect("/login");

	const userSettings: UserSettings = {
		firstName: result.first_name,
		lastName: result.last_name,
		email: result.email,
		createdAt: result.created_at,
		status: result.status.value,
	};

	return (
		<>
			<Header name={userSettings.firstName} />
			<PageLayout title='Profile'>
				<div className='col-12 col-lg-8'>
					<UserSettingsForm data={userSettings} className='w-100 mb-4' />
					<PasswordForm />
				</div>
				<div className='col-12 col-lg-4'>
					<div className='row gy-4'>
						<BaseTile title='Profile Picture' className='col-12'>
							<ImageDrop
								sizes='100vw'
								imageUpload={{
									id: "profile_picture",
									title: "Upload Image",
									url: result.image ? process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/users/" + result.image : undefined,
								}}
								action={editUserImageAction}
							/>
						</BaseTile>
						<UserActionsForm className='col-12' />
						<BaseTile title='UUID'>
							<p className='mb-0'>{user.uuid}</p>
						</BaseTile>
					</div>
				</div>
			</PageLayout>
		</>
	);
}
