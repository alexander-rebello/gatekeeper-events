"use client";

import { useActionState, useEffect, useState } from "react";
import { formatDate, isAlphaNumeric } from "@/components/utils";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { useFormStatus } from "react-dom";
import editDiscountCodeAction from "./actions";
import { z } from "zod";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabelAddition from "@/components/forms/labelAddition";
import ClientTime from "@/components/ClientTime";

export type DiscountCode = {
	value: number;
	code: string;
	isPercentage: boolean;
	status: string;
	createdAt: Date;
};

enum DiscountCodeStatus {
	ACTIVE = "ACTIVE",
	DISABLED = "DISABLED",
	DEACTIVATED = "DEACTIVATED",
}

export default function EditDiscountCodeModal({ data }: { data: DiscountCode | null }) {
	const [show, setShow] = useState<boolean>(false);

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editDiscountCodeAction, { message: undefined });

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

	const [code, setCode] = useState(data?.code ?? undefined);
	const [value, setValue] = useState<string | undefined>(data !== null ? (data.isPercentage ? data.value * 100 : data.value) + "" : undefined);
	const [isPercentage, setIsPercentage] = useState(data?.isPercentage ?? true);
	const [status, setStatus] = useState(data?.status ?? DiscountCodeStatus.ACTIVE);

	const [codeError, setCodeError] = useState<string | undefined>(undefined);
	const [valueError, setValueError] = useState<string | undefined>(undefined);
	const [statusError, setStatusError] = useState<string | undefined>(undefined);

	const router = useRouter();

	useEffect(() => setShow(true), []);

	useEffect(() => {
		if (state.message === "success") router.back();
		if (typeof state.message !== "object" || state.message === null) return;

		setCodeError(state.message.code ? state.message.code.join(", ") : "");
		setValueError(state.message.value ? state.message.value.join(", ") : "");
		setStatusError(state.message.status ? state.message.status.join(", ") : "");
	}, [state]);

	useEffect(() => {
		if (confirmClose == 1) setTimeout(() => setConfirmClose(2), 500);
		else if (confirmClose == 2) setTimeout(() => setConfirmClose(0), 3000);
	}, [confirmClose]);

	useEffect(() => {
		if (confirmDelete == 1) setTimeout(() => setConfirmDelete(2), 500);
		else if (confirmDelete == 2) setTimeout(() => setConfirmDelete(0), 3000);
	}, [confirmDelete]);

	useEffect(() => {
		if (code === undefined) return;

		if (code === "new") {
			setCodeError("Code cannot be 'new'");
			return;
		}

		const parsed = z
			.string()
			.trim()
			.min(1, "Required")
			.max(32, "Maximum of 32 characters")
			.refine((code) => isAlphaNumeric(code), "Code must be alphanumeric")
			.safeParse(code);
		setCodeError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [code]);

	useEffect(() => {
		if (value === undefined) return;

		const parsed = isPercentage ? z.coerce.number().positive("Invalid percentage").max(100, "Invalid percentage").safeParse(value) : z.coerce.number().positive("Invalid Value").safeParse(value);

		setValueError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [value, isPercentage]);

	const changesMade =
		data === null ? [code, value].some((e) => e !== undefined && e !== "") || status !== DiscountCodeStatus.ACTIVE || isPercentage !== true : code !== data.code || value !== (data.isPercentage ? data.value * 100 : data.value) + "" || status !== data.status || isPercentage !== data.isPercentage;

	const invalid = [codeError, valueError, statusError].some((error) => error !== "" && error !== undefined);

	const valid = [codeError, valueError].every((error) => error === "") && (statusError === "" || statusError === undefined);

	return (
		<Modal show={show} onHide={() => {}} backdrop='static' keyboard={false} centered fullscreen='md-down'>
			<Modal.Body className={"p-4 rounded border  border-" + (invalid ? "danger" : valid ? "success" : "dark")}>
				<div>
					{data !== null && (
						<form action={formAction} id='deleteForm'>
							<input type='hidden' name='action' value='delete' />
							<input type='hidden' name='code' value={data.code} />
						</form>
					)}
					<form action={formAction}>
						<input type='hidden' name='new' value={data?.code ?? "new"} />
						<div className='px-2'>
							<div className='d-flex align-items-center'>
								<h3 className='mb-0 me-auto'>{data ? "Edit" : "Create"} Codes</h3>
								{changesMade && (
									<div className='d-flex align-items-center text-warning'>
										<FontAwesomeIcon icon={faTriangleExclamation} />
										<p className='mb-0 ms-2'>Unsaved changes</p>
									</div>
								)}
							</div>
							{data && (
								<p className='text-muted fs-6'>
									Created: <ClientTime date={data.createdAt} />
								</p>
							)}
							{status === DiscountCodeStatus.DEACTIVATED && <span className='text-danger'>This discount code has been deactivated by an admin. Please contact support</span>}
						</div>
						<hr />
						<div className='mb-3'>
							<label className='form-label mb-1 ms-2' htmlFor='code'>
								Discount Code
								<LabelAddition text='Must be unique. Is case-sensitive' /> <span className={"invalid-feedback" + (codeError !== undefined ? " d-inline" : "")}>{codeError}</span>
							</label>
							<input
								className={"bg-light bg-opacity-10 border-light form-control text-white fenix" + (codeError !== undefined ? (codeError.length > 0 ? " is-invalid" : " is-valid") : "")}
								type='text'
								value={code}
								onChange={(e) => setCode(e.target.value)}
								id='code'
								name='code'
								disabled={status === DiscountCodeStatus.DEACTIVATED}
							/>
						</div>
						<div className='mb-3'>
							<label className='form-label mb-1 ms-2' htmlFor='value'>
								{isPercentage ? "Percentage" : "Value"}
								<LabelAddition /> <span className={"invalid-feedback" + (valueError !== undefined ? " d-inline" : "")}>{valueError}</span>
							</label>
							<div className='input-group mb-3'>
								<input
									className={"bg-light bg-opacity-10 border-light form-control text-white fenix" + (valueError !== undefined ? (valueError.length > 0 ? " is-invalid" : " is-valid") : "")}
									type='number'
									value={value}
									onChange={(e) => setValue(e.target.value)}
									onKeyDown={() => {
										if (value === undefined) setValue("");
									}}
									id='value'
									name='value'
									disabled={status === DiscountCodeStatus.DEACTIVATED}
									aria-describedby='basic-addon2'
								/>
								<span className='input-group-text border-light fenix' id='basic-addon2'>
									{isPercentage ? "%" : "€"}
								</span>
							</div>
						</div>
						<div className='mb-3'>
							<label className='form-label mb-1 ms-2'>
								Discount Type
								<LabelAddition />
							</label>
							<div className='form-check ms-3'>
								<input className='form-check-input' type='radio' name='discountType' id='percentageDiscount' checked={isPercentage} onChange={() => setIsPercentage(true)} disabled={status === DiscountCodeStatus.DEACTIVATED} value='percentage' />
								<label className='form-check-label' htmlFor='percentageDiscount'>
									Percentage Discount
								</label>
							</div>
							<div className='form-check ms-3'>
								<input className='form-check-input' type='radio' name='discountType' id='absoluteDiscount' checked={!isPercentage} onChange={() => setIsPercentage(false)} disabled={status === DiscountCodeStatus.DEACTIVATED} value='absolute' />
								<label className='form-check-label' htmlFor='absoluteDiscount'>
									Absolute Value Discount
								</label>
							</div>
						</div>
						<div className='mb-3'>
							<label className='form-label mb-1 ms-2'>
								Status
								<LabelAddition />
							</label>
							<div className='form-check form-switch ms-3'>
								<input
									className='form-check-input'
									type='checkbox'
									role='switch'
									id='status'
									name='status'
									checked={status === DiscountCodeStatus.ACTIVE}
									onChange={() => setStatus(status === DiscountCodeStatus.ACTIVE ? DiscountCodeStatus.DISABLED : DiscountCodeStatus.ACTIVE)}
									disabled={status === DiscountCodeStatus.DEACTIVATED}
								/>
								<label className='form-check-label' htmlFor='status'>
									This discount code is {status === DiscountCodeStatus.ACTIVE ? "Active" : "Disabled"}
								</label>
							</div>
						</div>
						<p className='text-center text-danger'>{typeof state?.message == "string" ? state?.message : ""}</p>
						<div className='d-flex'>
							{data ? (
								confirmDelete == 0 ? (
									<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDelete(1)} disabled={status === DiscountCodeStatus.DEACTIVATED}>
										Delete
									</button>
								) : (
									<button className='btn btn-danger px-4' type='submit' form='deleteForm' disabled={confirmDelete !== 2 || status === DiscountCodeStatus.DEACTIVATED}>
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
							<button className={"btn btn-" + (!valid ? "outline-" : "") + "success px-4"} type='submit' disabled={pending || !valid || status === DiscountCodeStatus.DEACTIVATED}>
								{pending ? "Saving..." : "Save"}
							</button>
						</div>
					</form>
				</div>
			</Modal.Body>
		</Modal>
	);
}
