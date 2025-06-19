"use server";

import UserPageTile from "@/components/tiles/user-page-tile";
import Link from "next/link";
import { validateRequest } from "@/auth/lucia";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Verify Email",
	};
}

export default async function Login(props: Props) {
	const params = await props.params;
	const { user } = await validateRequest(true);
	if (user !== null && user.emailVerified) redirect("/admin/overview");

	let result;
	try {
		result = await prisma.token.findFirst({
			where: {
				AND: [
					{
						token: {
							equals: params.token,
						},
					},
					{
						type: {
							is: {
								value: "EMAIL",
							},
						},
					},
					{
						expires: {
							gt: new Date(),
						},
					},
				],
			},
			select: {
				user_id: true,
			},
		});
	} catch (e) {
		console.error(e);
		return "Internal server error. Please try again.";
	}

	if (result === null) redirect("/email-verification/invalid");

	try {
		await prisma.token.deleteMany({
			where: {
				user_id: result.user_id,
				type: {
					value: "EMAIL",
				},
			},
		});

		await prisma.user.update({
			where: {
				id: result.user_id,
			},
			data: {
				email_verified: new Date(),
			},
		});
	} catch (e) {
		console.error(e);
		return "Internal server error. Please try again.";
	}

	if (user) {
		return (
			<UserPageTile title='Verification successful!' description='You may now continue to the admin dashboard.' className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5'>
				<div className='text-center'>
					<Link href='/admin/overview' className='btn btn-primary my-2'>
						Continue
					</Link>
				</div>
			</UserPageTile>
		);
	} else {
		return (
			<UserPageTile title='Verification successful!' description='You may now log in.' className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
				<div className='text-center'>
					<Link href='/login' className='btn btn-primary my-2'>
						Continue
					</Link>
				</div>
			</UserPageTile>
		);
	}
}
