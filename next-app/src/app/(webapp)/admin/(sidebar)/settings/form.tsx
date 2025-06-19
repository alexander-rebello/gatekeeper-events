"use client";

import BaseTile from "@/components/tiles/base-tile";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { editEventSettingsAction } from "./actions";
import { Color, getStatusColor, getStatusIcon, localeToUtcDate, utcToInputValue } from "@/components/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useNotification from "@/components/notifications/useNotification";
import FormTooltip from "@/components/forms/labelAddition";

export type EventSettings = {
	title: string;
	location: string;
	token: string;
	eventStartDate: Date;
	eventEndDate: Date;
	sellStartDate?: Date;
	sellEndDate?: Date;
	shortDescription: string;
	longDescription?: string;
	status: string;
	paymentLink?: string;
	bank?: string;
	minor_allowance: boolean;
};

enum EventStatus {
	PUBLIC = "PUBLIC",
	HIDDEN = "HIDDEN",
	DISABLED = "DISABLED",
}

export default function EventSettingsForm({ className, data, canEdit }: { className: string; data: EventSettings; canEdit: boolean }) {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editEventSettingsAction, { message: undefined });

	const [title, setTitle] = useState(data.title);
	const [location, setLocation] = useState(data.location);
	const [token, setToken] = useState(data.token);
	const [eventStart, setEventStart] = useState(utcToInputValue(data.eventStartDate, true));
	const [eventEnd, setEventEnd] = useState(utcToInputValue(data.eventEndDate, true));
	const [saleStart, setSaleStart] = useState(data.sellStartDate ? utcToInputValue(data.sellStartDate, true) : undefined);
	const [saleEnd, setSaleEnd] = useState(data.sellEndDate ? utcToInputValue(data.sellEndDate, true) : undefined);
	const [shortDescription, setShortDescription] = useState(data.shortDescription);
	const [longDescription, setLongDescription] = useState(data.longDescription ?? undefined);
	const [status, setStatus] = useState(data.status);
	const [paymentLink, setPaymentLink] = useState(data.paymentLink);
	const [bank, setBank] = useState(data.bank);
	const [minorAllowance, setMinorAllowance] = useState(data.minor_allowance);

	const [titleError, setTitleError] = useState<string | undefined>(undefined);
	const [locationError, setLocationError] = useState<string | undefined>(undefined);
	const [tokenError, setTokenError] = useState<string | undefined>(undefined);
	const [eventStartError, setEventStartError] = useState<string | undefined>(undefined);
	const [eventEndError, setEventEndError] = useState<string | undefined>(undefined);
	const [saleStartError, setSaleStartError] = useState<string | undefined>(undefined);
	const [saleEndError, setSaleEndError] = useState<string | undefined>(undefined);
	const [shortDescriptionError, setShortDescriptionError] = useState<string | undefined>(undefined);
	const [longDescriptionError, setLongDescriptionError] = useState<string | undefined>(undefined);
	const [statusError, setStatusError] = useState<string | undefined>(undefined);
	const [paymentLinkError, setPaymentLinkError] = useState<string | undefined>(undefined);
	const [bankError, setBankError] = useState<string | undefined>(undefined);

	const { addNotification } = useNotification();

	const [confirmDiscard, setConfirmDiscard] = useState<number>(0);

	useEffect(() => {
		if (confirmDiscard == 1) setTimeout(() => setConfirmDiscard(2), 500);
		else if (confirmDiscard == 2) setTimeout(() => setConfirmDiscard(0), 3000);
	}, [confirmDiscard]);

	const discardChanges = () => {
		setConfirmDiscard(0);

		setTitle(data.title);
		setLocation(data.location);
		setToken(data.token);
		setEventStart(utcToInputValue(data.eventStartDate, true));
		setEventEnd(utcToInputValue(data.eventEndDate, true));
		setSaleStart(data.sellStartDate ? utcToInputValue(data.sellStartDate, true) : undefined);
		setSaleEnd(data.sellEndDate ? utcToInputValue(data.sellEndDate, true) : undefined);
		setShortDescription(data.shortDescription);
		setLongDescription(data.longDescription ?? undefined);
		setStatus(data.status);
		setPaymentLink(data.paymentLink);
		setBank(data.bank);
		setMinorAllowance(data.minor_allowance);
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

		setTitleError(state.message.title ? state.message.title.join(", ") : "");
		setLocationError(state.message.location ? state.message.location.join(", ") : "");
		setTokenError(state.message.token ? state.message.token.join(", ") : "");
		setEventStartError(state.message.eventStartDate ? state.message.eventStartDate.join(", ") : "");
		setEventEndError(state.message.eventEndDate ? state.message.eventEndDate.join(", ") : "");
		setSaleStartError(state.message.sellStartDate ? state.message.sellStartDate.join(", ") : "");
		setSaleEndError(state.message.sellEndDate ? state.message.sellEndDate.join(", ") : "");
		setShortDescriptionError(state.message.shortDescription ? state.message.shortDescription.join(", ") : "");
		setLongDescriptionError(state.message.longDescription ? state.message.longDescription.join(", ") : "");
		setStatusError(state.message.status ? state.message.status.join(", ") : "");
		setPaymentLinkError(state.message.paymentLink ? state.message.paymentLink.join(", ") : "");
		setBankError(state.message.bank ? state.message.bank.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (title === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(title);
		setTitleError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [title]);

	useEffect(() => {
		if (location === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(location);
		setLocationError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [location]);

	useEffect(() => {
		if (token === undefined) return;
		const parsed = z
			.string()
			.trim()
			.min(1, "Required")
			.min(4, "Minimum of 4 characters")
			.max(32, "Maximum of 32 characters")
			.regex(/^[a-zA-Z0-9]+$/, "Must be alphanumeric")
			.safeParse(token);
		setTokenError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [token]);

	useEffect(() => {
		if (bank === undefined) return;
		if (bank.trim() === "") {
			setBankError(undefined);
			return;
		}
		const parsed = z
			.string()
			.trim()
			.regex(/^([A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{1,2})?)?$/, "Must be a valid IBAN")
			.safeParse(bank);
		setBankError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [bank]);

	useEffect(() => {
		if (paymentLink === undefined) return;
		if (paymentLink.trim() === "") {
			setPaymentLinkError(undefined);
			return;
		}
		const parsed = z.string().trim().max(32, "Maximum of 32 characters").safeParse(paymentLink);
		setPaymentLinkError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [paymentLink]);

	useEffect(() => {
		let startParsed, endParsed;
		if (eventStart !== undefined) {
			startParsed = z.string().trim().min(1, "Required").safeParse(eventStart);
			if (!startParsed.success) setEventStartError(startParsed.error.errors[0].message);
		}
		if (eventEnd !== undefined) {
			endParsed = z.string().trim().min(1, "Required").safeParse(eventEnd);
			if (!endParsed.success) setEventEndError(endParsed.error.errors[0].message);
		}

		if (startParsed?.success && endParsed?.success && eventEnd <= eventStart) {
			setEventStartError("Start date must be before end date");
			setEventEndError("End date must be after start date");
		} else {
			if (startParsed?.success) setEventStartError("");
			if (endParsed?.success) setEventEndError("");
		}
	}, [eventStart, eventEnd]);

	useEffect(() => {
		if (saleStart !== undefined && saleStart !== "" && saleEnd !== undefined && saleEnd !== "" && saleEnd <= saleStart) {
			setSaleStartError("Start date must be before end date");
			setSaleEndError("End date must be after start date");
		} else {
			setSaleStartError(saleStart === undefined || saleStart === "" ? undefined : "");
			setSaleEndError(saleEnd === undefined || saleEnd === "" ? undefined : "");
		}
	}, [saleStart, saleEnd]);

	useEffect(() => {
		if (shortDescription === undefined) return;
		const parsed = z.string().trim().min(1, "Required").min(16, "Minimum of 16 characters").max(256, "Maximum of 256 characters").safeParse(shortDescription);
		setShortDescriptionError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [shortDescription]);

	useEffect(() => {
		if (longDescription === undefined) return;
		if (longDescription.trim() === "") {
			setLongDescriptionError(undefined);
			return;
		}
		const parsed = z.string().trim().min(32, "Minimum of 32 characters").max(1024, "Maximum of 1024 characters").safeParse(longDescription);
		setLongDescriptionError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [longDescription]);

	const valid = [titleError, locationError, eventStartError, eventEndError, shortDescriptionError, tokenError].every((error) => error === "") && [statusError, saleStartError, saleEndError, longDescriptionError, paymentLinkError, bankError].every((error) => error === undefined || error === "");

	const disabled = data.status === "DEACTIVATED" || !canEdit;

	return (
		<BaseTile title='Event Settings' className={className}>
			<form action={formAction} className='h-100 d-flex flex-column'>
				<div className='row gy-3 mb-3'>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='title'>
							Title
							<FormTooltip /> <span className={"invalid-feedback" + (titleError !== undefined ? " d-inline" : "")}>{titleError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (titleError !== undefined ? (titleError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='title'
							id='title'
							onChange={(e) => setTitle(e.target.value)}
							value={title}
							placeholder='z.B. Abiball 2024'
							disabled={disabled}
							type='text'
						/>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='location'>
							Location
							<FormTooltip /> <span className={"invalid-feedback" + (locationError !== undefined ? " d-inline" : "")}>{locationError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (locationError !== undefined ? (locationError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='location'
							id='location'
							onChange={(e) => setLocation(e.target.value)}
							value={location}
							placeholder='z.B. Abiball 2024'
							disabled={disabled}
							type='text'
						/>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='token'>
							Individual Link
							<FormTooltip text='This link will be used to join the event.' /> <span className={"invalid-feedback" + (tokenError !== undefined ? " d-inline" : "")}>{tokenError}</span>
						</label>
						<div className='input-group'>
							<span className='input-group-text border-light'>{process.env.NEXT_PUBLIC_BASE_URL}/e/</span>
							<input
								className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (tokenError !== undefined ? (tokenError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
								name='token'
								id='token'
								onChange={(e) => setToken(e.target.value)}
								value={token}
								placeholder='z.B. Abiball24'
								disabled={disabled}
								type='text'
							/>
						</div>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='status'>
							Status
							<FormTooltip text="Set to 'Public' to make the shop available" /> <span className={"invalid-feedback" + (statusError !== undefined ? " d-inline" : "")}>{statusError}</span>
						</label>
						<div className='input-group'>
							<span className={"input-group-text border-light text-" + getStatusColor(status)}>
								<FontAwesomeIcon icon={getStatusIcon(status)} />
							</span>

							<select
								className={"bg-light bg-opacity-10 form-select text-white fenix border-" + (statusError !== undefined ? (statusError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
								name='status'
								id='status'
								onChange={(e) => setStatus(e.target.value)}
								value={status}
								disabled={disabled}
							>
								{(Object.keys(EventStatus) as Array<keyof typeof EventStatus>).map((key) => (
									<option key={key} value={key}>
										{key.charAt(0) + key.toLowerCase().slice(1)}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='eventStartDate'>
							Event Start
							<FormTooltip /> <span className={"invalid-feedback" + (eventStartError !== undefined ? " d-inline" : "")}>{eventStartError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (eventStartError !== undefined ? (eventStartError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							type='datetime-local'
							name='eventStartDate'
							id='eventStartDate'
							onChange={(e) => setEventStart(e.target.value)}
							value={eventStart}
							disabled={disabled}
						/>
						<input type='hidden' name='eventStartDateUTC' value={localeToUtcDate(eventStart)} />
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='eventEndDate'>
							Event End
							<FormTooltip /> <span className={"invalid-feedback" + (eventEndError !== undefined ? " d-inline" : "")}>{eventEndError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (eventEndError !== undefined ? (eventEndError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							type='datetime-local'
							name='eventEndDate'
							id='eventEndDate'
							onChange={(e) => setEventEnd(e.target.value)}
							value={eventEnd}
							disabled={disabled}
						/>
						<input type='hidden' name='eventEndDateUTC' value={localeToUtcDate(eventEnd)} />
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='saleStartDate'>
							Sale Start
							<FormTooltip required={false} text="If not set, the shop will be available as soon as the status is set to 'Public'" /> <span className={"invalid-feedback" + (saleStartError !== undefined ? " d-inline" : "")}>{saleStartError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (saleStartError !== undefined ? (saleStartError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							type='datetime-local'
							name='saleStartDate'
							id='saleStartDate'
							onChange={(e) => setSaleStart(e.target.value)}
							value={saleStart}
							disabled={disabled}
						/>
						<input type='hidden' name='saleStartDateUTC' value={saleStart ? localeToUtcDate(saleStart) : undefined} />
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='saleEndDate'>
							Sale End
							<FormTooltip required={false} text='If not set, the shop will be available until the event starts.' /> <span className={"invalid-feedback" + (saleEndError !== undefined ? " d-inline" : "")}>{saleEndError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (saleEndError !== undefined ? (saleEndError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							type='datetime-local'
							name='saleEndDate'
							id='saleEndDate'
							onChange={(e) => setSaleEnd(e.target.value)}
							value={saleEnd}
							disabled={disabled}
						/>
						<input type='hidden' name='saleEndDateUTC' value={saleEnd ? localeToUtcDate(saleEnd) : undefined} />
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='paymentLink'>
							paymentLink Link
							<FormTooltip text='This is a payment option' required={false} /> <span className={"invalid-feedback" + (paymentLinkError !== undefined ? " d-inline" : "")}>{paymentLinkError}</span>
						</label>
						<div className='input-group'>
							<span className='input-group-text border-light'>paymentLink.me/</span>
							<input
								className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (paymentLinkError !== undefined ? (paymentLinkError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
								name='paymentLink'
								id='paymentLink'
								onChange={(e) => setPaymentLink(e.target.value)}
								value={paymentLink}
								placeholder='z.B. Abiball24'
								disabled={disabled}
								type='text'
							/>
						</div>
					</div>
					<div className='col-12 col-sm-6'>
						<label className='form-label mb-1 ms-2' htmlFor='bank'>
							IBAN
							<FormTooltip text='This is a payment option' required={false} /> <span className={"invalid-feedback" + (bankError !== undefined ? " d-inline" : "")}>{bankError}</span>
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (bankError !== undefined ? (bankError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							name='bank'
							id='bank'
							onChange={(e) => setBank(e.target.value)}
							value={bank}
							placeholder='DE00 0000 0000 0000 0000'
							disabled={disabled}
							type='text'
						/>
					</div>
					<div className='col-12'>
						<div className='form-check form-switch mt-2 ms-2'>
							<input
								className={"bg-light bg-opacity-10 border form-check-input text-white fenix border-" + (minorAllowance ? "success is-valid" : "light")}
								name='minorAllowance'
								id='minorAllowance'
								type='checkbox'
								checked={minorAllowance}
								onChange={(e) => setMinorAllowance(e.target.checked)}
								disabled={disabled}
							/>
							<label className='form-check-label' htmlFor='minorAllowance'>
								Show download link for responsibility delegation
								<FormTooltip text='Delegation of responsibility for a minor / "Muttizettel"' />
							</label>
						</div>
					</div>
				</div>
				<div className='position-relative mb-3'>
					<label className='form-label mb-1 ms-2' htmlFor='shortDescription'>
						Short Description
						<FormTooltip /> <span className={"invalid-feedback" + (shortDescriptionError !== undefined ? " d-inline" : "")}>{shortDescriptionError}</span>
					</label>
					<textarea
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (shortDescriptionError !== undefined ? (shortDescriptionError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						name='shortDescription'
						id='shortDescription'
						onChange={(e) => setShortDescription(e.target.value)}
						value={shortDescription}
						placeholder='A short description of the event'
						rows={1}
						disabled={disabled}
					/>
					<p className={"fs-6 text-muted mb-0 position-absolute top-0 end-0 me-3 mt-1"}>{shortDescription?.trim().length ?? 0} / 256</p>
				</div>
				<div className='position-relative mb-3 flex-grow-1 d-flex flex-column'>
					<label className='form-label mb-1 ms-2' htmlFor='longDescription'>
						Long Description <span className={"invalid-feedback" + (longDescriptionError !== undefined ? " d-inline" : "")}>{longDescriptionError}</span>
					</label>
					<textarea
						className={"flex-grow-1 bg-light bg-opacity-10 form-control text-white fenix border-" + (longDescriptionError !== undefined ? (longDescriptionError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						name='longDescription'
						id='longDescription'
						onChange={(e) => setLongDescription(e.target.value)}
						value={longDescription}
						placeholder='A long description of the event'
						rows={10}
						disabled={disabled}
					/>
					<p className={"fs-6 text-muted mb-0 position-absolute top-0 end-0 me-3 mt-1"}>{longDescription?.trim().length ?? 0} / 1024</p>
				</div>
				{canEdit && (
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
				)}
			</form>
		</BaseTile>
	);
}
