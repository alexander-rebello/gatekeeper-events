import UserPageTile from "@/components/tiles/user-page-tile";
import LoginForm from "./form";
import { AllowedPrivaleges, checkPrivaleges } from "@/auth/lucia";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Login",
	};
}

export default async function Login() {
	await checkPrivaleges(AllowedPrivaleges.GUEST, true, true);

	return (
		<UserPageTile title='Log in' description='Login to access the Admin Dashboard to manage your events' className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
			<LoginForm />
		</UserPageTile>
	);
}
