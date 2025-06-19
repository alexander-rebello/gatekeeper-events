"use client";

import BaseTile from "@/components/tiles/base-tile";
import { useFormStatus } from "react-dom";
import { deleteUserAction } from "../actions";
import { useActionState, useEffect, useState } from "react";

export default function UserActionsForm({ className }: { className?: string }) {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(deleteUserAction, "");

	const [confirm, setConfirm] = useState<number>(0);

	useEffect(() => {
		if (confirm == 1) setTimeout(() => setConfirm(2), 500);
		else if (confirm == 2) setTimeout(() => setConfirm(0), 3000);
	}, [confirm]);

	return (
		<BaseTile title='Actions' className={className}>
			<form action={formAction}>
				<input type='hidden' name='action' value='delete' />
				<p className='mb-3'>Your account will be permanently deleted after 30 days. Just log in again to reactivate it.</p>
				<p className='px-2 w-100 text-danger'>{typeof state == "string" ? (state == "success" ? "Success!" : state) : ""}</p>
				{confirm == 0 ? (
					<button className='btn btn-outline-danger w-100 shadow' type='button' onClick={() => setConfirm(1)}>
						Delete Account
					</button>
				) : (
					<button className='btn btn-danger w-100 shadow' type='submit' disabled={confirm !== 2 || pending}>
						Confirm Action
					</button>
				)}
			</form>
		</BaseTile>
	);
}
