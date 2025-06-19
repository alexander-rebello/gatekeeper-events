"use client";
import { useFormStatus } from "react-dom";
import { contactFormAction } from "./actions";
import { useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ContactForm() {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(contactFormAction, { message: undefined });

	const [name, setName] = useState<string | undefined>(undefined);
	const [email, setEmail] = useState<string | undefined>(undefined);
	const [message, setMessage] = useState<string | undefined>(undefined);
	const [agreeToTerms, setAgreeToTerms] = useState<boolean | undefined>(undefined);

	const [nameError, setNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [messageError, setMessageError] = useState<string | undefined>(undefined);
	const [agreeToTermsError, setAgreeToTermsError] = useState<string | undefined>(undefined);
	const [captchaError, setCaptchaError] = useState<string | undefined>(undefined);

	const captchaRef = useRef<null | any>(null);

	useEffect(() => {
		captchaRef.current.resetCaptcha();

		if (state.message === "success") {
			setName(undefined);
			setEmail(undefined);
			setMessage(undefined);
			setAgreeToTerms(undefined);

			setNameError(undefined);
			setEmailError(undefined);
			setMessageError(undefined);
			setAgreeToTermsError(undefined);

			return;
		}

		if (!state || typeof state.message !== "object" || state.message === null) return;

		setNameError(state.message.name?.join(", ") || "");
		setEmailError(state.message.email?.join(", ") || "");
		setMessageError(state.message.message?.join(", ") || "");
		setAgreeToTermsError(state.message.agreeToTerms?.join(", ") || "");
	}, [state]);

	useEffect(() => {
		if (name === undefined) return;

		const parsed = z.string().trim().min(1, "Required").safeParse(name);
		setNameError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [name]);

	useEffect(() => {
		if (email === undefined) return;

		const parsed = z.string().trim().min(1, "Required").email("Invalid email").safeParse(email);
		setEmailError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [email]);

	useEffect(() => {
		if (message === undefined) return;

		const parsed = z.string().trim().min(1, "Required").safeParse(message);
		setMessageError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [message]);

	useEffect(() => {
		if (agreeToTerms === undefined) return;

		setAgreeToTermsError(agreeToTerms ? "" : "You must agree to the terms and conditions");
	}, [agreeToTerms]);

	const valid = nameError == "" && emailError == "" && messageError == "" && agreeToTermsError == "" && captchaError == "";

	return (
		<form className='p-3 p-xl-4 mb-2' action={formAction}>
			<div className='mb-3'>
				<label className='form-label ps-2' htmlFor='name'>
					Name
				</label>
				<input
					className={"bg-light bg-opacity-10 form-control text-white fenix shadow-lg border-" + (nameError !== undefined ? (nameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
					type='text'
					id='name'
					name='name'
					placeholder='Name'
					value={name === undefined ? "" : name}
					onChange={(e) => setName(e.target.value)}
				/>
				<div className='invalid-feedback ps-2'>{nameError}</div>
			</div>
			<div className='mb-3'>
				<label className='form-label ps-2' htmlFor='email'>
					E-Mail Adresse
				</label>
				<input
					className={"bg-light bg-opacity-10 form-control text-white fenix shadow-lg border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
					type='email'
					id='email'
					name='email'
					placeholder='Email'
					value={email === undefined ? "" : email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<div className='invalid-feedback ps-2'>{emailError}</div>
			</div>
			<div className='mb-3'>
				<label className='form-label ps-2' htmlFor='message'>
					Nachricht
				</label>
				<textarea
					className={"bg-light bg-opacity-10 form-control text-white fenix shadow-lg border-" + (messageError !== undefined ? (messageError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
					id='message'
					name='message'
					rows={6}
					placeholder='Deine Nachricht an uns'
					value={message === undefined ? "" : message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<div className='invalid-feedback ps-2'>{messageError}</div>
			</div>
			<div className='mb-3 d-flex flex-column align-items-center'>
				<div className='form-check ps-2'>
					<input
						className={"bg-light bg-opacity-10 border form-check-input text-white fenix border-" + (agreeToTermsError !== undefined ? (agreeToTermsError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						name='agreeToTerms'
						id='agreeToTerms'
						type='checkbox'
						checked={agreeToTerms === undefined ? false : agreeToTerms}
						onChange={(e) => setAgreeToTerms(e.target.checked)}
					/>
					<label className='form-check-label' htmlFor='agreeToTerms'>
						Ich akzeptiere die <Link href='/datenschutz'>Datenschutzbestimmungen</Link>
					</label>
					<p className='invalid-feedback d-block my-0'>&nbsp;{agreeToTermsError}</p>
				</div>
			</div>
			<div className='mb-3 d-flex flex-column align-items-center'>
				<HCaptcha
					ref={captchaRef}
					sitekey='011eee70-3ead-4dfb-9fa1-353b8f539e72'
					theme={"dark"}
					onVerify={() => setCaptchaError("")}
					onOpen={() => setCaptchaError(undefined)}
					onClose={() => setCaptchaError("Required")}
					onError={(err) => {
						console.error(err);
						setCaptchaError("Something went wrong. Please try again.");
					}}
					languageOverride='de'
					onChalExpired={() => setCaptchaError("Captcha expired")}
				/>
				<p className='invalid-feedback d-block my-0'>&nbsp;{captchaError}</p>
			</div>
			<div>
				<button className='btn btn-primary d-block w-100 shadow' type='submit' disabled={pending || !valid}>
					{pending ? "Senden..." : "Senden"}
				</button>
				<p className='text-center text-danger'>{typeof state.message === "string" && state.message !== "success" ? state.message : ""}</p>
				<p className='text-center text-success'>{typeof state.message === "string" && state.message == "success" ? "Your message has been sent. We'll get back to you shortly." : ""}</p>
			</div>
		</form>
	);
}
