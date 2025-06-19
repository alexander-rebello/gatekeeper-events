"use server";

import signup, { SignupActionError } from "@/auth/actions/signup-action";
import { verifyHCaptcha } from "@/auth/hcaptcha";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type LoginServerError = {
	message: SignupActionError;
};

export default async function signupAction(prevState: LoginServerError, formData: FormData): Promise<LoginServerError> {
	if (!verifyHCaptcha(formData.get("h-captcha-response"))) {
		return {
			message: "Captcha verification failed. Please try again",
		};
	}

	const error = await signup({
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		agreeToTerms: formData.get("agreeToTerms"),
	});

	if (error) {
		return {
			message: error,
		};
	} else {
		revalidatePath("/");
		redirect("/email-verification");
	}
}
