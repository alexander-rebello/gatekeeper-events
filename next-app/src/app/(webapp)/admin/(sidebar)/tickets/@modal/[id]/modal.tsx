"use client";

import { useActionState, useEffect, useState } from "react";
import { HEX_REGEX, formatDate } from "@/components/utils";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { useFormStatus } from "react-dom";
import editTicketAction from "./actions";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import LabelAddition from "@/components/forms/labelAddition";
import ClientTime from "@/components/ClientTime";

export type Ticket = {
	id: number;
	title: string;
	description: string;
	color: string;
	price: number;
	maxQuantity: number;
	status: string;
	createdAt: Date;
	position: number;
};

enum TicketStatus {
	ACTIVE = "ACTIVE",
	HIDDEN = "HIDDEN",
	DISABLED = "DISABLED",
	DEACTIVATED = "DEACTIVATED",
}

export default function EditTicketsModal({ data }: { data: Ticket | null }) {
	const [show, setShow] = useState<boolean>(false);

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editTicketAction, { message: undefined });

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

	const [title, setTitle] = useState(data?.title ?? undefined);
	const [description, setDescription] = useState(data?.description ?? undefined);
	const [price, setPrice] = useState(data?.price.toFixed(2).toString() ?? undefined);
	const [maxQuantity, setMaxQuantity] = useState(data?.maxQuantity.toString() ?? undefined);
	const [color, setColor] = useState(data?.color ?? "#375a7f");
	const [status, setStatus] = useState(data?.status ?? TicketStatus.ACTIVE);
	const [position, setPosition] = useState(data?.position.toString() ?? undefined);

	const [titleError, setTitleError] = useState<string | undefined>(undefined);
	const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
	const [priceError, setPriceError] = useState<string | undefined>(undefined);
	const [maxQuantityError, setMaxQuantityError] = useState<string | undefined>(undefined);
	const [colorError, setColorError] = useState<string | undefined>(undefined);
	const [statusError, setStatusError] = useState<string | undefined>(undefined);
	const [positionError, setPositionError] = useState<string | undefined>(undefined);

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

		setTitleError(state.message.title ? state.message.title.join(", ") : "");
		setDescriptionError(state.message.description ? state.message.description.join(", ") : "");
		setPriceError(state.message.price ? state.message.price.join(", ") : "");
		setMaxQuantityError(state.message.maxQuantity ? state.message.maxQuantity.join(", ") : "");
		setColorError(state.message.color ? state.message.color.join(", ") : "");
		setStatusError(state.message.status ? state.message.status.join(", ") : "");
		setPositionError(state.message.position ? state.message.position.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (title === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(title);
		setTitleError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [title]);

	useEffect(() => {
		if (description === undefined) return;
		const parsed = z.string().trim().max(256, "Maximum of 256 characters").safeParse(description);
		setDescriptionError(parsed.success ? (description === "" ? undefined : "") : parsed.error.errors[0].message);
	}, [description]);

	useEffect(() => {
		if (price === undefined) return;

		const parsed = z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().positive("Invalid Value"))
			.safeParse(price);
		setPriceError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [price]);

	useEffect(() => {
		if (maxQuantity === undefined) return;
		const parsed = z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().int("Must be an integer").min(0, "Must be 0 or greater"))
			.safeParse(maxQuantity);
		setMaxQuantityError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [maxQuantity]);

	useEffect(() => {
		if (color === undefined) return;
		const parsed = z.string().trim().regex(HEX_REGEX, "Only hexadecimal values allowed").safeParse(color);
		setColorError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [color]);

	useEffect(() => {
		if (position === undefined) return;
		const parsed = z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().int("Must be an integer").positive("Must be a positive number"))
			.safeParse(position);
		setPositionError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [position]);

	const changesMade =
		data === null
			? [title, description, price, maxQuantity, position].some((e) => e !== undefined && e !== "") || status !== TicketStatus.ACTIVE || color !== "#375a7f"
			: title !== data.title || description !== data.description || price !== data.price.toFixed(2).toString() || maxQuantity !== data.maxQuantity.toString() || color !== data.color || status !== data.status || position !== data.position.toString();

	const invalid = [titleError, descriptionError, priceError, maxQuantityError, positionError].some((error) => error !== "" && error !== undefined);

	const valid = [titleError, priceError, maxQuantityError, positionError].every((error) => error === "") && (descriptionError === undefined || descriptionError === "");

	return (
		<Modal show={show} onHide={() => {}} backdrop='static' keyboard={false} size='lg' centered fullscreen='md-down'>
			<Modal.Body className={"p-4 rounded border  border-" + (invalid ? "danger" : valid ? "success" : "dark")}>
				<div>
					{data !== null && (
						<form action={formAction} id='deleteForm'>
							<input type='hidden' name='action' value='delete' />
							<input type='hidden' name='id' value={data.id} />
						</form>
					)}
					<form action={formAction}>
						<input type='hidden' name='id' value={data?.id ?? "new"} />
						<div className='px-2'>
							<div className='d-flex justify-content-between align-items-center'>
								<h3 className='mb-0'>{data ? "Edit" : "Create"} Ticket</h3>
								{changesMade && (
									<div className='d-flex align-items-center text-warning'>
										<FontAwesomeIcon icon={faTriangleExclamation} />
										<p className='mb-0 ms-2'>Unsaved changes</p>
									</div>
								)}
								{data && (
									<p className='text-muted fs-6 mb-0'>
										<ClientTime date={data.createdAt} />
									</p>
								)}
							</div>
							{status === TicketStatus.DEACTIVATED ? <p className='text-danger'>This Ticket has been deactivated by an admin. Please contact support</p> : null}
						</div>
						<hr />
						<div className='row gy-3 mb-4'>
							<div className='col-12 col-lg-6'>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='title'>
										Title
										<LabelAddition /> <span className={"invalid-feedback" + (titleError !== undefined ? " d-inline" : "")}>{titleError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (titleError !== undefined ? (titleError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='text'
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										id='title'
										name='title'
										disabled={status === TicketStatus.DEACTIVATED}
									/>
								</div>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='price'>
										Price
										<LabelAddition /> <span className={"invalid-feedback" + (priceError !== undefined ? " d-inline" : "")}>{priceError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (priceError !== undefined ? (priceError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='number'
										value={price}
										onChange={(e) => setPrice(e.target.value)}
										onKeyDown={() => {
											if (price === undefined) setPrice("");
										}}
										id='price'
										name='price'
										disabled={status === TicketStatus.DEACTIVATED}
									/>
								</div>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='maxQuantity'>
										Max. Quantity
										<LabelAddition text='Set to zero to disable the limit' /> <span className={"invalid-feedback" + (maxQuantityError !== undefined ? " d-inline" : "")}>{maxQuantityError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (maxQuantityError !== undefined ? (maxQuantityError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='number'
										value={maxQuantity}
										onChange={(e) => setMaxQuantity(e.target.value)}
										onKeyDown={() => {
											if (maxQuantity === undefined) setMaxQuantity("");
										}}
										id='maxQuantity'
										name='maxQuantity'
										disabled={status === TicketStatus.DEACTIVATED}
									/>
								</div>
								<div>
									<label className='form-label mb-1 ms-2' htmlFor='position'>
										Position
										<LabelAddition text='All available tickets will be sorted by this position startingg with the lowest' /> <span className={"invalid-feedback" + (positionError !== undefined ? " d-inline" : "")}>{positionError}</span>
									</label>
									<input
										className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (positionError !== undefined ? (positionError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										type='number'
										value={position}
										onChange={(e) => setPosition(e.target.value)}
										onKeyDown={() => {
											if (position === undefined) setPosition("");
										}}
										id='position'
										name='position'
										disabled={status === TicketStatus.DEACTIVATED}
									/>
								</div>
							</div>
							<div className='col-12 col-lg-6 d-flex flex-column'>
								<div className='mb-3'>
									<label className='form-label mb-1 ms-2' htmlFor='color'>
										Color <span className={"invalid-feedback" + (colorError !== undefined ? " d-inline" : "")}>{colorError}</span>
									</label>
									<div className='input-group'>
										<label className='input-group-text border-light' htmlFor='color'>
											{color}
										</label>
										<input className='bg-light bg-opacity-10 form-control text-white fenix p-0 border-light' style={{ height: "auto" }} type='color' value={color} onChange={(e) => setColor(e.target.value)} id='color' name='color' disabled={status === TicketStatus.DEACTIVATED} />
									</div>
								</div>
								<div className='flex-grow-1 d-flex flex-column'>
									<label className='form-label mb-1 ms-2' htmlFor='description'>
										Description <span className={"invalid-feedback" + (descriptionError !== undefined ? " d-inline" : "")}>{descriptionError}</span>
									</label>
									<textarea
										className={"bg-light bg-opacity-10 form-control text-white fenix flex-grow-1 border-" + (descriptionError !== undefined ? (descriptionError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										id='description'
										name='description'
										disabled={status === TicketStatus.DEACTIVATED}
									/>
								</div>
							</div>

							<div className='col-12'>
								<label className='form-label mb-1 ms-2' htmlFor='maxQuantity'>
									Status
									<LabelAddition text='Hidden Tickets are not visible in the shop but can be added to an order' /> <span className={"invalid-feedback" + (statusError !== undefined ? " d-inline" : "")}>{statusError}</span>
								</label>
								<div className='row'>
									{(Object.keys(TicketStatus) as Array<keyof typeof TicketStatus>).map(
										(key) =>
											key !== "DEACTIVATED" && (
												<div key={key} className='col'>
													<input id={"status-" + key} className='btn-check w-100' type='radio' autoComplete='off' name='status' checked={TicketStatus[key] == status} onChange={() => setStatus(TicketStatus[key])} value={key} />
													<label className='form-label d-flex justify-content-center align-items-center btn-outline-light btn mb-0' htmlFor={"status-" + key} style={TicketStatus[key] == status ? { backgroundColor: "#444" } : undefined}>
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
									<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDelete(1)} disabled={status === TicketStatus.DEACTIVATED}>
										Delete
									</button>
								) : (
									<button className='btn btn-danger px-4' type='submit' form='deleteForm' disabled={confirmDelete !== 2 || status === TicketStatus.DEACTIVATED}>
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
							<button className={"btn btn-" + (!valid ? "outline-" : "") + "success px-4"} type='submit' disabled={pending || !valid || status === TicketStatus.DEACTIVATED}>
								{pending ? "Saving..." : "Save"}
							</button>
						</div>
					</form>
				</div>
			</Modal.Body>
		</Modal>
	);
}
