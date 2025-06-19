import UserPageTile from "@/components/tiles/user-page-tile";
import PasswordForm from "./form";
import { checkPrivaleges, AllowedPrivaleges } from "@/auth/lucia";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Reset Password",
	};
}

export default async function NewPassword(props: Props) {
	const params = await props.params;
	await checkPrivaleges(AllowedPrivaleges.GUEST, true);

	const user = await prisma.token.findFirst({
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
							value: "PASSWORD",
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

	if (!user) redirect("/reset-password/invalid");

	return (
		<UserPageTile title='Reset Password' description='Enter a new password' className='col-12 col-md-10 col-xl-8 mb-3'>
			<PasswordForm token={params.token} />
		</UserPageTile>
	);
}
