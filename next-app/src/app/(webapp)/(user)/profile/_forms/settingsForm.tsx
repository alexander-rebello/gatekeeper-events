"use client";

import BaseTile from "@/components/tiles/base-tile";
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { editUserSettingsAction } from "../actions";
import { Color, formatDate, getStatusColor, getStatusIcon } from "@/components/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserSettings } from "../page";
import useNotification from "@/components/notifications/useNotification";
import LabelAddition from "@/components/forms/labelAddition";
import ClientTime from "@/components/ClientTime";

export default function EventSettingsForm({ className, data }: { className?: string; data: UserSettings }) {
	const { addNotification } = useNotification();

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editUserSettingsAction, { message: undefined });

	const [firstName, setFirstName] = useState(data.firstName);
	const [lastName, setLastName] = useState(data.lastName);
	const [email, setEmail] = useState(data.email);

	const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
	const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);

	const [confirmDiscard, setConfirmDiscard] = useState<number>(0);

	useEffect(() => {
		if (confirmDiscard == 1) setTimeout(() => setConfirmDiscard(2), 500);
		else if (confirmDiscard == 2) setTimeout(() => setConfirmDiscard(0), 3000);
	}, [confirmDiscard]);

	const discardChanges = () => {
		setConfirmDiscard(0);

		setFirstName(data.firstName);
		setLastName(data.lastName);
		setEmail(data.email);
	};

	useEffect(() => {
		if (typeof state.message === "string") {
			if (state.message == "success") {
				addNotification("Settings saved!", Color.Success);
			} else {
				addNotification(state.message, Color.Warning);
			}
		}

		if (!state || typeof state.message !== "object" || state.message === null) return;

		setFirstNameError(state.message.firstName ? state.message.firstName.join(", ") : "");
		setLastNameError(state.message.lastName ? state.message.lastName.join(", ") : "");
		setEmailError(state.message.email ? state.message.email.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (firstName === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(firstName);
		setFirstNameError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [firstName]);

	useEffect(() => {
		if (lastName === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(lastName);
		setLastNameError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [lastName]);

	useEffect(() => {
		if (email === undefined) return;
		const parsed = z.string().trim().min(1, "Required").email("Invalid email").safeParse(email);
		setEmailError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [email]);

	const valid = [firstNameError, lastNameError, emailError].every((error) => error === "");

	const disabled = data.status === "DEACTIVATED";

	return (
		<BaseTile
			title='Details'
			subtitle={
				<>
					Created at: + <ClientTime date={data.createdAt} />
				</>
			}
			className={className}
		>
			<form action={formAction} className='h-100 d-flex flex-column'>
				<div className='row mb-3'>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='firstName'>
							First Name
							<LabelAddition />
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (firstNameError !== undefined ? (firstNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='firstName'
							id='firstName'
							onChange={(e) => setFirstName(e.target.value)}
							value={firstName}
							placeholder='z.B. Peter'
							disabled={disabled}
							type='text'
						/>
						<p className='invalid-feedback d-block my-0'>&nbsp;{firstNameError}</p>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='lastName'>
							Last Name
							<LabelAddition />
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (lastNameError !== undefined ? (lastNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='lastName'
							id='lastName'
							onChange={(e) => setLastName(e.target.value)}
							value={lastName}
							placeholder='z.B. Mustermann'
							disabled={disabled}
							type='text'
						/>
						<p className='invalid-feedback d-block my-0'>&nbsp;{lastNameError}</p>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='email'>
							Email Address
							<LabelAddition />
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='email'
							id='email'
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							placeholder='z.B. 0j7nZ@example.com'
							disabled={disabled}
							type='email'
						/>
						<p className='invalid-feedback d-block my-0'>&nbsp;{emailError}</p>
					</div>
				</div>
				<div className='d-flex align-items-center'>
					<p className='px-2 me-auto text-danger'>{typeof state?.message == "string" && state.message !== "success" ? state.message : ""}</p>
					{confirmDiscard == 0 ? (
						<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDiscard(1)}>
							Discard Changes
						</button>
					) : (
						<button className='btn btn-danger px-4' type='button' disabled={confirmDiscard !== 2} onClick={() => discardChanges()}>
							Confirm Discard Changes
						</button>
					)}
					<button className={`btn btn-${!valid ? "outline-" : ""}success px-4 ms-3`} type='submit' disabled={pending || !valid}>
						{pending ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</BaseTile>
	);
}
