"use client";

import { useActionState, useEffect, useState } from "react";
import { formatDate } from "@/components/utils";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { useFormStatus } from "react-dom";
import editUserAction from "./actions";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import LabelAddition from "@/components/forms/labelAddition";
import ClientTime from "@/components/ClientTime";

export type User = {
	uuid: string;
	first_name: string;
	last_name: string;
	email: string;
	email_verified: Date | null;
	status: string;
	created_at: Date;
	events: Event[];
};

export type Event = {
	uuid: string;
	name: string;
};

enum UserStatus {
	ACTIVE = "ACTIVE",
	DISABLED = "DISABLED",
	DEACTIVATED = "DEACTIVATED",
}

export default function EditUserModal({ data }: { data: User | null }) {
	const [show, setShow] = useState<boolean>(false);

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editUserAction, { message: undefined });

	/*
		0=Show close button (initial; when clicked, switch to 1)
		1=Wait for 1 second, then switch to 2
		2=Show confirm close button (when clicked, close modal via redirect)
	*/
	const [confirmClose, setConfirmClose] = useState<number>(0);
	const [confirmDelete, setConfirmDelete] = useState<number>(0);

	const [firstName, setFirstName] = useState(data?.first_name ?? "");
	const [lastName, setLastName] = useState(data?.last_name ?? "");
	const [email, setEmail] = useState(data?.email ?? "");
	const [status, setStatus] = useState(data?.status ?? UserStatus.ACTIVE);

	const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
	const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [statusError, setStatusError] = useState<string | undefined>(undefined);

	const router = useRouter();

	useEffect(() => setShow(true), []);

	useEffect(() => {
		if (confirmClose == 1) setTimeout(() => setConfirmClose(2), 500);
		else if (confirmClose == 2) setTimeout(() => setConfirmClose(0), 3000);
	}, [confirmClose]);

	useEffect(() => {
		if (confirmDelete == 1) setTimeout(() => setConfirmDelete(2), 500);
		else if (confirmDelete == 2) setTimeout(() => setConfirmDelete(0), 3000);
	}, [confirmDelete]);

	useEffect(() => {
		if (typeof state.message !== "object" || state.message === null) return;

		setFirstNameError(state.message.firstName ? state.message.firstName.join(", ") : "");
		setLastNameError(state.message.lastName ? state.message.lastName.join(", ") : "");
		setEmailError(state.message.email ? state.message.email.join(", ") : "");
		setStatusError(state.message.status ? state.message.status.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (firstName === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(50, "Maximum of 50 characters").safeParse(firstName);
		setFirstNameError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [firstName]);

	useEffect(() => {
		if (lastName === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(50, "Maximum of 50 characters").safeParse(lastName);
		setLastNameError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [lastName]);

	useEffect(() => {
		if (email === undefined) return;
		const parsed = z.string().trim().email("Must be a valid email address").safeParse(email);
		setEmailError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [email]);

	const changesMade = data === null ? [firstName, lastName, email].some((e) => e !== undefined && e !== "") || status !== UserStatus.ACTIVE : firstName !== data.first_name || lastName !== data.last_name || email !== data.email || status !== data.status;

	const invalid = [firstNameError, lastNameError, emailError].some((error) => error !== "" && error !== undefined);

	const valid = [firstNameError, lastNameError, emailError].every((error) => error === "");

	return (
		<Modal show={show} onHide={() => {}} backdrop='static' keyboard={false} size='lg' centered fullscreen='md-down'>
			<Modal.Body className={"p-4 rounded border  border-" + (invalid ? "danger" : valid ? "success" : "dark")}>
				<div>
					{data !== null && (
						<form action={formAction} id='deleteForm'>
							<input type='hidden' name='action' value='delete' />
							<input type='hidden' name='id' value={data.uuid} />
						</form>
					)}
					<form action={formAction}>
						<input type='hidden' name='id' value={data?.uuid ?? "new"} />
						<div className='px-2'>
							<div className='d-flex justify-content-between align-items-center'>
								<h3 className='mb-0'>{data ? "Edit" : "Create"} User</h3>
								{changesMade && (
									<div className='d-flex align-items-center text-warning'>
										<FontAwesomeIcon icon={faTriangleExclamation} />
										<p className='mb-0 ms-2'>Unsaved changes</p>
									</div>
								)}
								{data && (
									<p className='text-muted fs-6 mb-0'>
										<ClientTime date={data.created_at} />
									</p>
								)}
							</div>
							{status === UserStatus.DEACTIVATED ? <p className='text-danger'>This user has been deactivated by an admin. Please contact support</p> : null}
						</div>
						<hr />
						<div className='row gy-3 mb-4'>
							<div className='col-12 col-lg-6'>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='firstName'>
										First Name
										<LabelAddition /> <span className={"invalid-feedback" + (firstNameError !== undefined ? " d-inline" : "")}>{firstNameError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (firstNameError !== undefined ? (firstNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='text'
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										id='firstName'
										name='firstName'
										disabled={status === UserStatus.DEACTIVATED}
									/>
								</div>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='lastName'>
										Last Name
										<LabelAddition /> <span className={"invalid-feedback" + (lastNameError !== undefined ? " d-inline" : "")}>{lastNameError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (lastNameError !== undefined ? (lastNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='text'
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										id='lastName'
										name='lastName'
										disabled={status === UserStatus.DEACTIVATED}
									/>
								</div>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='email'>
										Email
										<LabelAddition /> <span className={"invalid-feedback" + (emailError !== undefined ? " d-inline" : "")}>{emailError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										id='email'
										name='email'
										disabled={status === UserStatus.DEACTIVATED}
									/>
								</div>
							</div>
							<div className='col-12 col-lg-6 d-flex flex-column'>
								{data && data.email_verified && (
									<div className='mb-3'>
										<label className='form-label mb-1 ms-2'>Email Verified</label>
										<p className='text-success'>{<ClientTime date={data.email_verified} />}</p>
									</div>
								)}
								{data && data.events.length > 0 && (
									<div className='mb-3'>
										<label className='form-label mb-1 ms-2'>Associated Events</label>
										<div className='d-flex flex-wrap gap-2'>
											{data.events.map((event) => (
												<span key={event.uuid} className='badge bg-primary'>
													{event.name}
												</span>
											))}
										</div>
									</div>
								)}
							</div>

							<div className='col-12'>
								<label className='form-label mb-1 ms-2' htmlFor='status'>
									Status
									<LabelAddition text='Disabled users cannot log in but their data is preserved' /> <span className={"invalid-feedback" + (statusError !== undefined ? " d-inline" : "")}>{statusError}</span>
								</label>
								<div className='row'>
									{(Object.keys(UserStatus) as Array<keyof typeof UserStatus>).map(
										(key) =>
											key !== "DEACTIVATED" && (
												<div key={key} className='col'>
													<input id={"status-" + key} className='btn-check w-100' type='radio' autoComplete='off' name='status' checked={UserStatus[key] == status} onChange={() => setStatus(UserStatus[key])} value={key} />
													<label className='form-label d-flex justify-content-center align-items-center btn-outline-light btn mb-0' htmlFor={"status-" + key} style={UserStatus[key] == status ? { backgroundColor: "#444" } : undefined}>
														<span className='me-2'>{key.charAt(0) + key.toLowerCase().slice(1)}</span>
													</label>
												</div>
											)
									)}
								</div>
							</div>
						</div>
						<p className='text-center text-danger'>{typeof state?.message == "string" ? state?.message : ""}</p>
						<div className='d-flex'>
							{data ? (
								confirmDelete == 0 ? (
									<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDelete(1)} disabled={status === UserStatus.DEACTIVATED}>
										Delete
									</button>
								) : (
									<button className='btn btn-danger px-4' type='submit' form='deleteForm' disabled={confirmDelete !== 2 || status === UserStatus.DEACTIVATED}>
										Confirm Delete
									</button>
								)
							) : null}
							{!changesMade ? (
								<button className='btn btn-outline-danger ms-auto me-2 px-4' type='button' onClick={() => router.back()}>
									Close
								</button>
							) : confirmClose == 0 ? (
								<button className='btn btn-outline-danger ms-auto me-2 px-4' type='button' onClick={() => setConfirmClose(1)}>
									Close
								</button>
							) : (
								<button className='btn btn-danger ms-auto me-2 px-4' type='button' onClick={() => router.back()} disabled={confirmClose !== 2}>
									Confirm Close
								</button>
							)}
							<button className={"btn btn-" + (!valid ? "outline-" : "") + "success px-4"} type='submit' disabled={pending || !valid || status === UserStatus.DEACTIVATED}>
								{pending ? "Saving..." : "Save"}
							</button>
						</div>
					</form>
				</div>
			</Modal.Body>
		</Modal>
	);
}
