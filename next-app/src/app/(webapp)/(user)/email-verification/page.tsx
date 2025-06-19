"use server";
import logoutAction from "@/auth/actions/logout-action";
import { AllowedPrivaleges, checkPrivaleges } from "@/auth/lucia";
import UserPageTile from "@/components/tiles/user-page-tile";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { EmailVerificationForm } from "./form";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Verify Email",
	};
}

export default async function CheckInbox() {
	const { user } = await checkPrivaleges(AllowedPrivaleges.USER, false, false);
	return (
		<UserPageTile className='col-12 col-md-8 col-lg-5' icon={faEnvelopeOpen} title={"Let's verify your email, " + user!.firstName + "!"} description='Almost done! We will send you a verification e-mail telling you what to do next. Click the link in the e-mail to continue.'>
			<EmailVerificationForm />
			<div className='text-center'>
				<form action={logoutAction}>
					<button className='link-primary bg-transparent border-0 text-decoration-underline text-primary' type='submit'>
						Not you? Log out
					</button>
				</form>
			</div>
		</UserPageTile>
	);
}
