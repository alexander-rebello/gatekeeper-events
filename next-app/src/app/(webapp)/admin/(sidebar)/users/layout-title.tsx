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
				Collaborators <FontAwesomeIcon icon={faCircleQuestion} className='ms-2' size='2xs' style={{ cursor: "help" }} onClick={handleShow} />
			</div>
			<Modal show={show} onHide={handleClose} centered>
				<Modal.Body>
					Here you can add new collaborators to your event. You can assign different roles to them to manage their permissions.
					<a onClick={handleClose} className='link ms-3'>
						Close
					</a>
				</Modal.Body>
			</Modal>
		</>
	);
}
