"use client";
import { sendVeryficationEmail } from "./actions";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useActionState, useState } from "react";

export function EmailVerificationForm() {
	const [state, formAction] = useActionState(sendVeryficationEmail, {});

	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [countdown, setCountdown] = useState(0);

	const handleButtonClick = () => {
		setIsButtonDisabled(true);
		setCountdown(60);

		const intervalId = setInterval(() => {
			setCountdown((prevCountdown) => {
				if (prevCountdown === 1) {
					clearInterval(intervalId);
					setIsButtonDisabled(false);
					return 0;
				}
				return prevCountdown - 1;
			});
		}, 1000);
	};

	return (
		<form className='d-flex flex-column align-items-center' action={formAction}>
			<p className='text-danger'>{state.error}</p>
			<p className='text-success'>{state.success}</p>
			<button className='btn btn-primary my-3 d-flex align-items-center' type='submit' onClick={handleButtonClick} disabled={isButtonDisabled}>
				Send Email
				<FontAwesomeIcon icon={faPaperPlane} className='ms-2' />
			</button>
			<p className='text-muted'>{countdown > 0 ? `Resend in ${countdown} second${countdown > 1 ? "s" : ""}` : ""}</p>
		</form>
	);
}
