import UserPageTile from "@/components/tiles/user-page-tile";
import SignupForm from "./form";
import { AllowedPrivaleges, checkPrivaleges } from "@/auth/lucia";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Signup",
	};
}

export default async function Signup() {
	await checkPrivaleges(AllowedPrivaleges.GUEST, true);

	return (
		<UserPageTile title='Signup' className='col-12 col-sm-10 col-md-12 col-lg-10 col-xl-8 col-xxl-7'>
			<SignupForm />
		</UserPageTile>
	);
}
