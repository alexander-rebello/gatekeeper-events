"use client";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function CopyToClipboardBtn({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) setTimeout(() => setCopied(false), 3000);
	}, [copied]);

	return (
		<button
			type='button'
			className='btn btn-primary px-4'
			onClick={() => {
				if (!copied) {
					navigator.clipboard.writeText(text);
					setCopied(true);
				}
			}}
		>
			{!copied ? (
				<>
					Copy Link
					<FontAwesomeIcon icon={faCopy} className='ms-2' />
				</>
			) : (
				<>
					Copied
					<FontAwesomeIcon icon={faCheck} className='ms-2' />
				</>
			)}
		</button>
	);
}
