import UserPageTile from "@/components/tiles/user-page-tile";
import ResetPasswordForm from "./form";
import { checkPrivaleges, AllowedPrivaleges } from "@/auth/lucia";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Reset Password",
	};
}

export default async function EnterEMail() {
	await checkPrivaleges(AllowedPrivaleges.GUEST, true);

	return (
		<UserPageTile title='Reset Password' description='Enter your email to reset your password' className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
			<ResetPasswordForm />
		</UserPageTile>
	);
}
