"use client";

import BaseTile from "@/components/tiles/base-tile";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { createNewEventAction } from "./actions";
import FormTooltip from "@/components/forms/labelAddition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { localeToUtcDate } from "@/components/utils";

export default function NewEventForm() {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(createNewEventAction, { message: undefined });

	const [title, setTitle] = useState<string | undefined>(undefined);
	const [token, setToken] = useState<string | undefined>(undefined);
	const [location, setLocation] = useState<string | undefined>(undefined);
	const [eventStart, setEventStart] = useState<string | undefined>(undefined);
	const [eventEnd, setEventEnd] = useState<string | undefined>(undefined);
	const [shortDescription, setShortDescription] = useState<string | undefined>(undefined);

	const [titleError, setTitleError] = useState<string | undefined>(undefined);
	const [tokenError, setTokenError] = useState<string | undefined>(undefined);
	const [locationError, setLocationError] = useState<string | undefined>(undefined);
	const [eventStartError, setEventStartError] = useState<string | undefined>(undefined);
	const [eventEndError, setEventEndError] = useState<string | undefined>(undefined);
	const [shortDescriptionError, setShortDescriptionError] = useState<string | undefined>(undefined);

	const [confirmDiscard, setConfirmDiscard] = useState<number>(0);

	useEffect(() => {
		if (confirmDiscard == 1) setTimeout(() => setConfirmDiscard(2), 500);
		else if (confirmDiscard == 2) setTimeout(() => setConfirmDiscard(0), 3000);
	}, [confirmDiscard]);

	const discardChanges = () => {
		setConfirmDiscard(0);

		setTitle("");
		setToken("");
		setLocation("");
		setEventStart("");
		setEventEnd("");
		setShortDescription("");
	};

	useEffect(() => {
		if (typeof state.message !== "object" || state.message === null) return;

		setTitleError(state.message.title ? state.message.title.join(", ") : "");
		setTokenError(state.message.token ? state.message.token.join(", ") : "");
		setLocationError(state.message.location ? state.message.location.join(", ") : "");
		setEventStartError(state.message.eventStartDate ? state.message.eventStartDate.join(", ") : "");
		setEventEndError(state.message.eventEndDate ? state.message.eventEndDate.join(", ") : "");
		setShortDescriptionError(state.message.shortDescription ? state.message.shortDescription.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (title === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(title);
		setTitleError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [title]);

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
		if (location === undefined) return;
		const parsed = z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters").safeParse(location);
		setLocationError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [location]);

	useEffect(() => {
		if (eventStart === undefined) return;
		const parsed = z.string().trim().min(1, "Required").safeParse(eventStart);
		setEventStartError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [eventStart]);

	useEffect(() => {
		if (eventEnd === undefined) return;
		const parsed = z
			.string()
			.trim()
			.min(1, "Required")
			.refine((val) => !eventStart || new Date(val) > new Date(eventStart), { message: "End date must be after start date" })
			.safeParse(eventEnd);
		setEventEndError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [eventStart, eventEnd]);

	useEffect(() => {
		if (shortDescription === undefined) return;
		const parsed = z.string().trim().min(1, "Required").min(16, "Minimum of 16 characters").max(256, "Maximum of 256 characters").safeParse(shortDescription);
		setShortDescriptionError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [shortDescription]);

	const valid = [titleError, tokenError, locationError, eventStartError, eventEndError, shortDescriptionError].every((error) => error === "");

	return (
		<BaseTile>
			<form action={formAction}>
				<div className='row gy-3 mb-3'>
					<div className='col-12 col-lg-6'>
						<div className='row gy-3'>
							<div className='co-12 col-md-6 col-lg-12'>
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
								/>
							</div>
							<div className='co-12 col-md-6 col-lg-12'>
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
								/>
							</div>
							<div className='co-12'>
								<label className='form-label mb-1 ms-2' htmlFor='token'>
									Individual Link
									<FormTooltip text='This link will be used to access the store of this event' /> <span className={"invalid-feedback" + (tokenError !== undefined ? " d-inline" : "")}>{tokenError}</span>
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
										type='text'
									/>
								</div>
							</div>
							<div className='co-12 col-md-6 col-lg-12'>
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
								/>
								<input type='hidden' name='eventStartDateUTC' value={eventStart ? localeToUtcDate(eventStart) : undefined} />
							</div>
							<div className='co-12 col-md-6 col-lg-12'>
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
								/>
								<input type='hidden' name='eventEndDateUTC' value={eventEnd ? localeToUtcDate(eventEnd) : undefined} />
							</div>
						</div>
					</div>
					<div className='col-12 col-lg-6'>
						<div className='position-relative d-flex flex-column h-100'>
							<label className='form-label mb-1 ms-2' htmlFor='shortDescription'>
								Short Description
								<FormTooltip /> <span className={"invalid-feedback" + (shortDescriptionError !== undefined ? " d-inline" : "")}>{shortDescriptionError}</span>
							</label>
							<textarea
								className={"bg-light bg-opacity-10 form-control text-white flex-grow-1 fenix border-" + (shortDescriptionError !== undefined ? (shortDescriptionError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
								name='shortDescription'
								id='shortDescription'
								onChange={(e) => setShortDescription(e.target.value)}
								value={shortDescription}
								placeholder='A short description of the event'
								rows={7}
							/>
							<p className={"fs-6 text-muted mb-0 position-absolute top-0 end-0 me-3 mt-1"}>{shortDescription?.trim().length ?? 0} / 256</p>
						</div>
					</div>
				</div>
				<div className='d-flex'>
					<p className='px-2 me-auto mb-0 mt-auto'>
						<span className='me-2 text-muted'>
							<FontAwesomeIcon icon={faInfoCircle} /> Additional preferences may be set later
						</span>
						<span className={"text-" + (state?.message === "success" ? "success" : "danger")}>{typeof state?.message == "string" ? (state.message == "success" ? "Success!" : state.message) : ""}</span>
					</p>
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
