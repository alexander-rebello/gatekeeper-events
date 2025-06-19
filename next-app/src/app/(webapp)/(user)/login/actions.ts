"use server";

import login, { LoginActionError } from "@/auth/actions/login-action";
import { verifyHCaptcha } from "@/auth/hcaptcha";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LoginServerError = {
	message: LoginActionError;
};

export default async function loginAction(prevState: LoginServerError, formData: FormData): Promise<LoginServerError> {
	if (!verifyHCaptcha(formData.get("h-captcha-response"))) {
		return {
			message: "Captcha verification failed. Please try again",
		};
	}

	const error = await login({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (error) {
		console.log("Login error:", error);
		return {
			message: error,
		};
	}

	revalidatePath("/");
	redirect("/admin/overview");
}
