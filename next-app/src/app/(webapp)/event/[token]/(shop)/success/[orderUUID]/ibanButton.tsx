"use client";

import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function IBANButton({ iban }: { iban: string }) {
	const [state, setState] = useState<boolean>(false);

	useEffect(() => {
		if (state == true) setTimeout(() => setState(false), 2000);
	}, [state]);

	return (
		<div className='bg-light bg-opacity-10 d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded-3 position-relative ms-sm-2 shadow border border-light'>
			<div>
				<p className='text-body-emphasis mb-0'>Überweisung</p>
				<p className='fs-6 text-muted fenix mb-0 lh-1'>{iban}</p>
			</div>
			{state == false ? (
				<a
					className='text-primary text-decoration-none lh-1 mb-1'
					style={{ cursor: "pointer" }}
					onClick={() => {
						setState(true);
						if (iban) navigator.clipboard.writeText(iban);
					}}
				>
					<FontAwesomeIcon icon={faCopy} />
				</a>
			) : (
				<FontAwesomeIcon icon={faCheck} className='text-success lh-1 mb-1' />
			)}
		</div>
	);
}
