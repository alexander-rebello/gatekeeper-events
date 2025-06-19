import UserPageTile from "@/components/tiles/user-page-tile";
import { faArrowRight, faBan, faChevronRight, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Invalid Reset Link",
};

export default function CheckInbox() {
	return (
		<UserPageTile className='col-12 col-md-8 col-lg-5' icon={faBan} title='Invalid link' description='The link you used to reset your password is invalid or expired. Please try again.'>
			<div className='d-flex justify-content-center'>
				<Link className='btn btn-primary my-3 d-flex align-items-center' href='/reset-password'>
					Retry now
					<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
				</Link>
			</div>
		</UserPageTile>
	);
}
