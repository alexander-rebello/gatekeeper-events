import UserPageTile from "@/components/tiles/user-page-tile";
import { faArrowRight, faChevronRight, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Check Inbox",
};

export default function CheckInbox() {
	return (
		<UserPageTile className='col-12 col-md-8 col-lg-5' icon={faEnvelopeOpen} title='Check your inbox!' description={"Almost done! We have sent you a verification e-mail telling you what to do next."}>
			<div className='d-flex justify-content-center'>
				<Link className='btn btn-primary my-3 d-flex align-items-center' href='/login'>
					Go to Login
					<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
				</Link>
			</div>
		</UserPageTile>
	);
}
