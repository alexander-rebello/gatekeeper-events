import { validateRequest } from "@/auth/lucia";
import UserPageTile from "@/components/tiles/user-page-tile";
import { faBan, faChevronRight, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Invalid Verification Link",
};

export default async function CheckInbox() {
	const { user } = await validateRequest(true);

	if (user !== null) {
		return (
			<UserPageTile className='col-12 col-md-8 col-lg-5' icon={faBan} title='Invalid link' description='The link you used to verify your email is invalid or expired. Please try again.'>
				<div className='d-flex justify-content-center'>
					<Link className='btn btn-primary my-3 d-flex align-items-center' href='/email-verification'>
						Retry now
						<FontAwesomeIcon icon={faPaperPlane} className='ms-2' />
					</Link>
				</div>
			</UserPageTile>
		);
	} else {
		return (
			<UserPageTile className='col-12 col-md-8 col-lg-5' icon={faBan} title='Invalid link' description='The link you used to verify your email is invalid or expired. Please try again.'>
				<div className='d-flex justify-content-center'>
					<Link className='btn btn-primary my-3 d-flex align-items-center' href='/login'>
						Login and retry
						<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
					</Link>
				</div>
			</UserPageTile>
		);
	}
}
