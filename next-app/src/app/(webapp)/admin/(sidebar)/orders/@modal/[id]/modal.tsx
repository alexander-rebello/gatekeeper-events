"use client";

import { useActionState, useEffect, useState } from "react";
import { formatDate, getStatusColor, getStatusIcon } from "@/components/utils";
import { useRouter } from "next/navigation";
import { Modal, Spinner } from "react-bootstrap";
import { useFormStatus } from "react-dom";
import { editOrderAction, deliverTicketsAction, resendConfirmationAction } from "./actions";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown, faPaperPlane, faPlus, faTicket, faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import LabelAddition from "@/components/forms/labelAddition";
import ClientTime from "@/components/ClientTime";

export type FullOrder = {
	uuid: string;
	first_name: string;
	last_name: string;
	email: string;
	created_at: Date;
	message: string | null;
	notes: string | null;
	status: string;
	tickets: Ticket[];
	discount_code: DiscountCode | null;
};

export type Ticket = {
	uuid: string;
	ticket_type_id: number;
	name: string | null;
};

export type TicketType = {
	id: number;
	title: string;
	price: number;
	color: string;
	max_quantity: number;
	quantity?: number;
	status: string;
};

export type DiscountCode = {
	value: number;
	code: string;
	is_percentage: boolean;
};

enum OrderStatus {
	COMPLETED = "COMPLETED",
	PENDING = "PENDING",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
}

export default function EditOrderModal({ data, ticketTypes, discountCodes, canEdit, canDelete, canSendTickets }: { data: FullOrder | null; ticketTypes: TicketType[]; discountCodes: DiscountCode[]; canEdit: boolean; canDelete: boolean; canSendTickets: boolean }) {
	const [show, setShow] = useState<boolean>(false);

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editOrderAction, { message: undefined });

	const [deliverState, deliverAction] = useActionState(deliverTicketsAction, "");
	const [deliverTicketsState, setDeliverTicketsState] = useState<"initial" | "pending" | "success" | "error">("initial");

	useEffect(() => {
		if (deliverState === "success") {
			setDeliverTicketsState("initial");
		} else {
			setDeliverTicketsState("error");
		}
	}, [deliverState]);

	const [resendState, resendAction] = useActionState(resendConfirmationAction, "");
	const [resendConfirmationState, setResendConfirmationState] = useState<"initial" | "pending" | "success" | "error">("initial");

	useEffect(() => {
		if (resendState === "success") {
			setResendConfirmationState("initial");
		} else {
			setResendConfirmationState("error");
		}
	}, [resendState]);

	/*
		0=Show delete button (inital; when clicked, switch to 1)
		1=Wait for 1 second, then switch to 2
		2=Show confirm delete button (when clicked, close modal via form submission)
	*/
	const [confirmDelete, setConfirmDelete] = useState<number>(0);

	/*
		0=Show close button (initial; when clicked, switch to 1)
		1=Wait for 1 second, then switch to 2
		2=Show confirm close button (when clicked, close modal via redirect)
	*/
	const [confirmClose, setConfirmClose] = useState<number>(0);

	const [addSelectValue, setAddSelectValue] = useState<number>(ticketTypes.length > 0 ? ticketTypes[0].id : -1);

	const [tickets, setTickets] = useState(data?.tickets ?? undefined);
	const [discountCode, setDiscountCode] = useState(data?.discount_code?.code ?? undefined);
	const [firstName, setFirstName] = useState(data?.first_name ?? undefined);
	const [lastName, setLastName] = useState(data?.last_name ?? undefined);
	const [email, setEmail] = useState(data?.email ?? undefined);
	const [status, setStatus] = useState(data?.status ?? OrderStatus.PENDING);
	const [notes, setNotes] = useState(data?.notes ?? "");

	const [ticketsError, setTicketsError] = useState<string | undefined>(undefined);
	const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
	const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [statusError, setStatusError] = useState<string | undefined>(undefined);
	const [discountCodeError, setDiscountCodeError] = useState<string | undefined>(undefined);

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
		if (state.message === "success") router.back();
		if (typeof state.message !== "object" || state.message === null) return;

		setFirstNameError(state.message.firstName?.join(", ") || "");
		setLastNameError(state.message.lastName?.join(", ") || "");
		setEmailError(state.message.email?.join(", ") || "");
		setStatusError(state.message.status?.join(", ") || "");
		setTicketsError(state.message.tickets?.join(", ") || "");
		setDiscountCodeError(state.message.discountCode?.join(", ") || "");
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

		const parsed = z.string().trim().min(1, "Required").email("Invalid email").max(64, "Maximum of 64 characters").safeParse(email);
		setEmailError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [email]);

	useEffect(() => {
		if (tickets === undefined) return;

		setTicketsError(tickets.length === 0 ? "No tickets selected" : "");
	}, [tickets]);

	const cartValue: number = tickets
		? Math.floor(
				tickets.reduce((n, ticket) => {
					const ticketType = ticketTypes.find((t) => t.id === ticket.ticket_type_id);
					if (!ticketType) {
						if (ticketTypes.length > 0) console.error(`Ticket type ${ticket.ticket_type_id} not found`);
						return n;
					}
					return n + ticketType.price;
				}, 0) * 100
		  ) / 100
		: 0;

	const code = discountCodes.find((d) => d.code === discountCode);
	const discountedSum = code ? Math.max(0, code.is_percentage ? Math.floor(cartValue * (1 - code.value) * 100) / 100 : Math.floor(cartValue - code.value)) : undefined;

	const changesMade =
		data === null
			? [firstName, lastName, email, discountCode, tickets].some((value) => value !== undefined && value !== "") || status !== OrderStatus.PENDING
			: firstName !== data.first_name || lastName !== data.last_name || email !== data.email || discountCode !== data.discount_code?.code || status !== data.status || tickets !== data.tickets;

	const invalid = [ticketsError, firstNameError, lastNameError, emailError, discountCodeError].some((error) => error !== "" && error !== undefined);

	const valid = [ticketsError, firstNameError, lastNameError, emailError].every((error) => error === "") && (statusError === undefined || statusError === "") && (discountCodeError === undefined || discountCodeError === "");

	console.log(tickets);

	return (
		<Modal show={show} onHide={() => {}} backdrop='static' keyboard={false} size='xl' centered fullscreen='lg-down'>
			<Modal.Body className={"p-4 rounded border  border-" + (invalid ? "danger" : valid ? "success" : "dark")}>
				{ticketTypes.length === 0 ? (
					<div className='text-center p-4'>
						<p className='mb-4'>You have to create a ticket first in order to create an order</p>
						<Link href='/admin/tickets' className='btn btn-primary w-100'>
							Create ticket
						</Link>
					</div>
				) : (
					<div>
						{data !== null && (
							<>
								{canDelete && (
									<form action={formAction} id='deleteForm'>
										<input type='hidden' name='action' value='delete' />
										<input type='hidden' name='uuid' value={data.uuid} />
									</form>
								)}

								{canSendTickets && (
									<form
										action={deliverAction}
										id='deliverForm'
										onSubmit={() => {
											setDeliverTicketsState("pending");
										}}
									>
										<input type='hidden' name='action' value='deliver' />
										<input type='hidden' name='uuid' value={data.uuid} />
										<input type='hidden' name='email' value={email} />
									</form>
								)}

								<form
									action={resendAction}
									id='resendForm'
									onSubmit={() => {
										setResendConfirmationState("pending");
									}}
								>
									<input type='hidden' name='action' value='resend' />
									<input type='hidden' name='uuid' value={data.uuid} />
									<input type='hidden' name='email' value={email} />
								</form>
							</>
						)}
						<form action={formAction}>
							<input type='hidden' name='uuid' value={data?.uuid ?? "new"} />
							<div className='d-flex justify-content-between align-items-center'>
								<h2 className='lh-1 mb-0'>{data ? "Edit" : "Create"} Order</h2>
								{changesMade && (
									<div className='d-flex align-items-center text-warning'>
										<FontAwesomeIcon icon={faTriangleExclamation} />
										<p className='mb-0 ms-2'>Unsaved changes</p>
									</div>
								)}
								{data && <p className='text-muted fs-6 mb-0'>{<ClientTime date={data.created_at} />}</p>}
							</div>
							<hr />
							<div className='row gy-4'>
								<div className='col-12 col-xl-4'>
									<div className='bg-light bg-opacity-10 shadow-lg d-flex flex-column h-100 rounded-3 p-3'>
										<div>
											<input type='hidden' name='tickets' value={JSON.stringify(tickets)} />
											<ul className='list-group mb-2 overflow-y-auto scrollable-orders scroll-shadow-container' style={{ maxHeight: "357.8px" }}>
												{tickets ? (
													tickets.map((item, index) => {
														const ticketType = ticketTypes.find((t) => t.id === item.ticket_type_id);
														if (!ticketType) {
															console.error(`Ticket type ${item.ticket_type_id} not found`);
															return null;
														}
														return (
															<li className='list-group-item px-3' key={index}>
																<div className='overflow-hidden'>
																	<div className='fs-5 d-flex align-items-center'>
																		<FontAwesomeIcon icon={faTicket} className='me-2' color={ticketType.color} />
																		<p className='mb-0 me-auto text-truncate'>{ticketType.title}</p>
																		<p className='text-muted mb-0 fenix lh-1'>{ticketType.price}€</p>
																	</div>
																	<div className='d-flex align-items-center'>
																		<input
																			type='text'
																			className='form-control border-0 form-control-sm bg-light bg-opacity-10 text-white py-0 me-2'
																			style={{ minHeight: "auto" }}
																			form='unknown'
																			value={item.name ?? ""}
																			onChange={(e) => setTickets(tickets.map((t) => (t.uuid === item.uuid ? { ...t, name: e.target.value } : t)))}
																			placeholder='Name'
																			disabled={!canEdit}
																		/>
																		{canEdit && (
																			<button
																				className='border-0 bg-transparent text-danger fs-6'
																				onClick={() => {
																					let tmpTickets = [...tickets];
																					tmpTickets.splice(index, 1);
																					setTickets(tmpTickets);
																				}}
																				type='button'
																			>
																				<FontAwesomeIcon icon={faTrash} />
																			</button>
																		)}
																	</div>
																</div>
															</li>
														);
													})
												) : (
													<li className='list-group-item px-2'>No Tickets</li>
												)}
											</ul>
										</div>
										<div className='mb-auto'>
											<p className='ps-2 invalid-feedback mt-1 mb-0 d-block'>&nbsp;{ticketsError}</p>
										</div>
										{ticketTypes.length > 0 ? (
											canEdit ? (
												<div className='input-group'>
													<select className='bg-light bg-opacity-10 border-light form-select form-select-sm text-white fenix' value={addSelectValue} onChange={(e) => setAddSelectValue(parseInt(e.target.value) ?? ticketTypes[0].id)}>
														{ticketTypes.map((type) => (
															<option key={type.id} value={type.id}>
																{type.title} ({type.price}€)
															</option>
														))}
													</select>
													<button
														className='btn btn-outline-light bg-light bg-opacity-10'
														type='button'
														onClick={() => {
															const newTicket: Ticket = { uuid: "", name: "", ticket_type_id: addSelectValue };
															setTickets(tickets ? [...tickets, newTicket] : [newTicket]);
														}}
													>
														<FontAwesomeIcon icon={faPlus} />
													</button>
												</div>
											) : (
												<p>No Permission</p>
											)
										) : (
											<p>No Ticket Types</p>
										)}
										<hr />
										<div className='d-flex align-items-center position-relative'>
											<select
												className={"bg-light bg-opacity-10 border-light form-select text-white fenix" + (discountCodeError !== undefined ? (discountCodeError.length > 0 ? " is-invalid" : " is-valid") : "")}
												name='discountCode'
												value={discountCode}
												onChange={(e) => setDiscountCode(e.target.value)}
												disabled={!canEdit}
											>
												<option value=''>No Discount</option>
												{discountCodes.map((code) => (
													<option key={code.code} value={code.code}>
														{code.code} ({code.is_percentage ? Math.floor(code.value * 10000) / 100 + "%" : code.value + "€"})
													</option>
												))}
											</select>
											<div className='invalid-feedback'>{discountCodeError}</div>
										</div>
										<hr />
										<div className='d-flex justify-content-between align-items-center'>
											<p className='fs-4 mb-0 lh-1'>Sum:</p>
											<p className='fs-3 mb-0 fenix lh-1'>{discountedSum !== undefined ? discountedSum.toFixed(2) : cartValue.toFixed(2)} €</p>
										</div>
										{discountedSum !== undefined && (
											<div className='text-muted d-flex justify-content-between align-items-center'>
												<p className='mb-0 lh-1'>Without discount:</p>
												<p className='mb-0 fenix lh-1'>{cartValue.toFixed(2)} €</p>
											</div>
										)}
									</div>
								</div>
								<div className='col-12 col-xl-8 ps-2 d-flex flex-column py-2'>
									<div className='mb-2'>
										<div className='row gy-3'>
											<div className='col-12 col-sm-6'>
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
														disabled={!canEdit}
													/>
												</div>
												<div className='mb-3'>
													<label className='form-label mb-1 ms-2' htmlFor='lastName'>
														Last Name
														<LabelAddition /> <span className={"invalid-feedback" + (lastNameError !== undefined ? " d-inline" : "")}>{lastNameError}</span>
													</label>
													<div className='invalid-feedback'>{lastNameError}</div>
													<input
														className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (lastNameError !== undefined ? (lastNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
														type='text'
														value={lastName}
														onChange={(e) => setLastName(e.target.value)}
														id='lastName'
														name='lastName'
														disabled={!canEdit}
													/>
												</div>
												<div className={data !== null ? "mb-3" : ""}>
													<label className='form-label mb-1 ms-2' htmlFor='email'>
														E-Mail Address
														<LabelAddition /> <span className={"invalid-feedback" + (emailError !== undefined ? " d-inline" : "")}>{emailError}</span>
													</label>
													<div className='input-group'>
														<input
															className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
															type='text'
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															id='email'
															name='email'
															disabled={!canEdit}
														/>
														<a className='btn btn-light bg-light bg-opacity-10 d-flex align-items-center ' href={"mailto:" + email}>
															<FontAwesomeIcon icon={faPaperPlane} />
														</a>
													</div>
												</div>
												{data !== null && canSendTickets && (
													<>
														<div className='mb-3'>
															<label className='form-label mb-1 ms-2'>
																Tickets actions
																<LabelAddition required={false} text='Order must be completed' /> <span className={"invalid-feedback" + (deliverState ? " d-inline" : "") + (deliverState === "success" ? " text-success" : "")}>{deliverState}</span>
															</label>
															<div className='input-group'>
																<button
																	className={`btn btn-${status !== "COMPLETED" ? "outline-light" : "success"} d-flex align-items-center justify-content-center flex-grow-1`}
																	type='submit'
																	form='deliverForm'
																	disabled={pending || deliverTicketsState === "pending" || deliverTicketsState === "success" || status !== "COMPLETED" || (emailError !== undefined && emailError.length > 0)}
																>
																	Deliver all tickets
																	{deliverTicketsState === "pending" ? (
																		<>
																			<Spinner className='ms-2' as='span' animation='border' size='sm' role='status' aria-hidden='true' />
																			<span className='visually-hidden'>Loading...</span>
																		</>
																	) : (
																		<FontAwesomeIcon icon={faPaperPlane} className='ms-2' />
																	)}
																</button>
																<a className='btn btn-outline-light' href={"/api/order/" + data.uuid + "/download"} download>
																	<FontAwesomeIcon icon={faCloudArrowDown} />
																</a>
															</div>
														</div>
														<div>
															<label className='form-label mb-1 ms-2'>
																Confirmation
																<LabelAddition required={false} text='Is send automatically once. Order must be completed / pending' /> <span className={"invalid-feedback" + (resendState ? " d-inline" : "") + (resendState === "success" ? " text-success" : "")}>{resendState}</span>
															</label>
															<button
																className='btn btn-success d-flex align-items-center justify-content-center w-100'
																type='submit'
																form='resendForm'
																disabled={pending || resendConfirmationState === "success" || resendConfirmationState === "pending" || (status !== "COMPLETED" && status !== "PENDING") || (emailError !== undefined && emailError.length > 0)}
															>
																Resend <span className='d-none d-md-inline px-md-2'>order</span> confirmation
																{resendConfirmationState === "pending" ? (
																	<>
																		<Spinner className='ms-2' as='span' animation='border' size='sm' role='status' aria-hidden='true' />
																		<span className='visually-hidden'>Loading...</span>
																	</>
																) : (
																	<FontAwesomeIcon icon={faPaperPlane} className='ms-2' />
																)}
															</button>
														</div>
													</>
												)}
											</div>
											<div className='col-12 col-sm-6 d-flex flex-column'>
												{data !== null && (
													<div className={"mb-3 d-flex flex-column" + (data.message !== null ? " flex-grow-1" : "")}>
														<label className='form-label mb-1 ms-2' htmlFor='message'>
															Message from Buyer
														</label>
														{data.message !== null ? (
															<textarea className='bg-light bg-opacity-10 border-light form-control flex-grow-1 text-white fenix' readOnly disabled defaultValue={data.message} style={{ resize: "none" }} id='message' name='message' />
														) : (
															<input className='bg-light bg-opacity-10 form-control text-muted fenix border-secondary' type='text' value='No message' disabled readOnly id='message' name='message' />
														)}
													</div>
												)}
												<div className='flex-grow-1 d-flex flex-column'>
													<label className='form-label mb-1 ms-2' htmlFor='notes'>
														Notes
													</label>
													<textarea className='bg-light bg-opacity-10 border-light form-control flex-grow-1 text-white fenix' value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "none" }} id='notes' name='notes' disabled={!canEdit} />
												</div>
											</div>
											<div className='col-12 d-flex flex-column'>
												<label className='form-label mb-1 ms-2'>
													Status <span className={"invalid-feedback" + (statusError !== undefined ? " d-inline" : "")}>{statusError}</span>
												</label>
												<div className='row row-cols-2 row-cols-md-4 gy-3' role='group'>
													{(Object.keys(OrderStatus) as Array<keyof typeof OrderStatus>).map((key) => {
														const active = OrderStatus[key] == status;
														const color = getStatusColor(key);
														return (
															<div key={key} className='col'>
																<input id={"status-" + key} className='btn-check w-100' type='radio' autoComplete='off' name='status' checked={active} onChange={() => setStatus(OrderStatus[key])} value={key} disabled={!canEdit} />
																<label className={"form-label d-flex justify-content-center align-items-center btn mb-0 btn-outline-light" + (active ? " bg-opacity-10 bg-light text-" + color + " border-" + color : "")} htmlFor={"status-" + key}>
																	<span className='me-2'>{key.charAt(0) + key.toLowerCase().slice(1)}</span>
																	<FontAwesomeIcon icon={getStatusIcon(key)} />
																</label>
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</div>
									<div className='mt-auto'>
										<p className='w-100 text-center text-danger mb-2'>{typeof state?.message == "string" ? state?.message : ""}</p>
										<div className='d-flex'>
											{data && canDelete ? (
												confirmDelete == 0 ? (
													<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDelete(1)} disabled={status === OrderStatus.COMPLETED}>
														Delete
													</button>
												) : (
													<button className='btn btn-danger px-4' type='submit' form='deleteForm' disabled={confirmDelete !== 2 || status === OrderStatus.COMPLETED}>
														Confirm Delete
													</button>
												)
											) : null}
											{!changesMade ? (
												<button className='btn btn-outline-danger ms-auto px-4' type='button' onClick={() => router.back()}>
													Close
												</button>
											) : confirmClose == 0 ? (
												<button className='btn btn-outline-danger ms-auto px-4' type='button' onClick={() => setConfirmClose(1)}>
													Close
												</button>
											) : (
												<button className='btn btn-danger ms-auto px-4' type='button' onClick={() => router.back()} disabled={confirmClose !== 2}>
													Confirm Close
												</button>
											)}
											{canEdit && (
												<button className={"btn btn-" + (!valid ? "outline-" : "") + "success px-4 ms-2"} type='submit' disabled={pending || !valid}>
													{pending ? "Saving..." : "Save"}
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				)}
			</Modal.Body>
		</Modal>
	);
}
