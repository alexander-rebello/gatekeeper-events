"use client";

import RequirementsField, { Requirement } from "@/components/forms/requirements-field";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import signupAction from "./actions";
import { useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import FormTooltip from "@/components/forms/labelAddition";

export default function SignupForm() {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(signupAction, { message: undefined });
	const [requirements, setRequirements] = useState<Requirement[]>([]);

	const [firstName, setFirstName] = useState<string | undefined>(undefined);
	const [lastName, setLastName] = useState<string | undefined>(undefined);
	const [email, setEmail] = useState<string | undefined>(undefined);
	const [password, setPassword] = useState<string | undefined>(undefined);
	const [confirmPassword, setConfirmPassword] = useState<string | undefined>(undefined);
	const [agreeToTerms, setAgreeToTerms] = useState<boolean | undefined>(undefined);

	const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
	const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
	const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);
	const [agreeToTermsError, setAgreeToTermsError] = useState<string | undefined>(undefined);

	const [captchaError, setCaptchaError] = useState<string | undefined>(undefined);

	const captchaRef = useRef<null | any>(null);

	useEffect(() => {
		captchaRef.current.resetCaptcha();
		if (!state || typeof state.message !== "object" || state.message === null) return;

		setFirstNameError(state.message.firstName?.join(", ") || "");
		setLastNameError(state.message.lastName?.join(", ") || "");
		setEmailError(state.message.email?.join(", ") || "");
		setPasswordError(state.message.password?.join(", ") || "");
		setConfirmPasswordError(state.message.confirmPassword?.join(", ") || "");
		setAgreeToTermsError(state.message.agreeToTerms ? "You must agree to the terms and conditions" : "");
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
		setRequirements([
			{ title: "Minimum of 8 characters", fullfilled: z.string().min(8).safeParse(password).success, part: 1 },
			{
				title: "Uppercase and lowercase letters",
				fullfilled: z
					.string()
					.regex(/(?=.*[a-z])(?=.*[A-Z])/)
					.safeParse(password).success,
				part: 1,
			},
			{
				title: "Numbers and symbols",
				fullfilled: z
					.string()
					.regex(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
					.safeParse(password).success,
				part: 1,
			},
		]);
	}, [password]);

	useEffect(() => {
		if (password === undefined) return;

		setPasswordError(requirements.some((requirement) => !requirement.fullfilled) ? "Password not strong enough" : "");
	}, [requirements, password]);

	useEffect(() => {
		if (confirmPassword === undefined) return;

		setConfirmPasswordError(passwordError ? passwordError : confirmPassword !== password ? "Passwords don't match" : "");
	}, [password, confirmPassword, passwordError]);

	useEffect(() => {
		if (agreeToTerms === undefined) return;

		setAgreeToTermsError(agreeToTerms ? "" : "You must agree to the terms and conditions");
	}, [agreeToTerms]);

	const valid = [firstNameError, lastNameError, emailError, passwordError, confirmPasswordError, agreeToTermsError, captchaError].every((error) => error === "");

	return (
		<form className='row justify-content-center' action={formAction}>
			<div className='col-12 col-md-6'>
				<div>
					<label className='form-label' htmlFor='firstName'>
						First Name
						<FormTooltip text='This will be publicly visible as contact' />
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (firstNameError !== undefined ? (firstNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Your first Name'
						name='firstName'
						id='firstName'
						type='text'
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{firstNameError}</p>
				</div>
				<div>
					<label className='form-label' htmlFor='lastName'>
						Last Name
						<FormTooltip text='This will be publicly visible as contact' />
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (lastNameError !== undefined ? (lastNameError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Your last Name'
						name='lastName'
						id='lastName'
						type='text'
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{lastNameError}</p>
				</div>
				<div>
					<label className='form-label' htmlFor='email'>
						E-Mail Address
						<FormTooltip text='This will be publicly visible as contact' />
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (emailError !== undefined ? (emailError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Your E-Mail Address'
						name='email'
						id='email'
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{emailError}</p>
				</div>
			</div>
			<div className='col-12 col-md-6'>
				<div>
					<label className='form-label' htmlFor='password'>
						Password
						<FormTooltip />
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (passwordError !== undefined ? (passwordError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Your new Password'
						name='password'
						id='password'
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{passwordError}</p>
				</div>
				<div>
					<label className='form-label' htmlFor='confirmPassword'>
						Confirm Password
						<FormTooltip />
					</label>
					<input
						className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (confirmPasswordError !== undefined ? (confirmPasswordError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						placeholder='Confirm your new Password'
						name='confirmPassword'
						id='confirmPassword'
						type='password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<p className='invalid-feedback d-block my-0'>&nbsp;{confirmPasswordError}</p>
				</div>
				<RequirementsField className='mb-2' requirements={requirements} />
			</div>
			<div className='col-12 d-flex flex-column align-items-center my-2'>
				<div className='form-check mb-2'>
					<input
						className={"bg-light bg-opacity-10 border form-check-input text-white fenix border-" + (agreeToTermsError !== undefined ? (agreeToTermsError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
						name='agreeToTerms'
						id='agreeToTerms'
						type='checkbox'
						checked={agreeToTerms}
						onChange={(e) => setAgreeToTerms(e.target.checked)}
					/>
					<label className='form-check-label' htmlFor='agreeToTerms'>
						I agree to the <Link href='/datenschutz'>Privacy Policy (Datenschutzbestimmungen)</Link>
						<FormTooltip />
					</label>
					<p className='invalid-feedback d-block my-0'>&nbsp;{agreeToTermsError}</p>
				</div>
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
			<div className='col-12 col-md-6'>
				<button className={`btn btn-${valid ? "primary" : "outline-light"} shadow w-100 mb-1`} type='submit' disabled={pending || !valid}>
					Sign-Up
				</button>

				<div className='text-center'>
					Already signed up? <Link href='/login'>Login</Link>
				</div>
			</div>
		</form>
	);
}
