"use client";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Modal } from "react-bootstrap";

export default function LayoutTitle() {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	return (
		<>
			<div className='d-flex align-items-center'>
				Tickets <FontAwesomeIcon icon={faCircleQuestion} className='ms-2' size='2xs' style={{ cursor: "help" }} onClick={handleShow} />
			</div>
			<Modal show={show} onHide={handleClose} centered>
				<Modal.Body>
					Here you can define different types of tickets. For Example, you could create one ticket type 'Standart' and another 'VIP'. These tickets will be visible in the shop where your customers can buy them.
					<a onClick={handleClose} className='link ms-3'>
						Close
					</a>
				</Modal.Body>
			</Modal>
		</>
	);
}
