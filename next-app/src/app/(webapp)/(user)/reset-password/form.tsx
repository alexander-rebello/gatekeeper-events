"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import resetPasswordAction from "./actions";
import { useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ResetPasswordForm() {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(resetPasswordAction, { message: undefined });

	const [email, setEmail] = useState<string | undefined>(undefined);

	const [emailError, setEmailError] = useState<string | undefined>(undefined);

	const [captchaError, setCaptchaError] = useState<string | undefined>(undefined);

	const captchaRef = useRef<null | any>(null);

	useEffect(() => {
		captchaRef.current.resetCaptcha();
		if (!state || typeof state.message !== "object" || state.message === null) return;

		setEmailError(state.message.email?.join(", ") || "");
	}, [state]);

	useEffect(() => {
		if (email === undefined) return;

		const parsed = z.string().trim().min(1, "Required").email("Invalid email").safeParse(email);
		setEmailError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [email]);

	const valid = emailError === "" && captchaError === "";

	return (
		<form className='row justify-content-center' action={formAction}>
			<div className='col-12'>
				<div className='mb-3'>
					<label className='form-label' htmlFor='email'>
						E-Mail Address <span className={"invalid-feedback" + (emailError !== undefined ? " d-inline" : "")}>{emailError}</span>
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Your E-Mail Address'
						name='email'
						id='email'
						type='text'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className='mb-2 d-flex flex-column align-items-center'>
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
						onChalExpired={() => setCaptchaError("Captcha expired")}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{captchaError}</p>
				</div>
				<div className='mb-1'>
					<button className={`btn btn-${valid ? "primary" : "outline-light"} shadow w-100`} type='submit' disabled={pending || !valid}>
						Reset now
					</button>
					{typeof state.message === "string" ? <p className='text-center text-danger mb-1'>{state.message}</p> : null}
				</div>
				<div className='text-center'>
					Remember your password? <Link href='/login'>Login</Link>
				</div>
			</div>
		</form>
	);
}
