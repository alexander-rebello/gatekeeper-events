"use server";

import { verifyHCaptcha } from "@/auth/hcaptcha";
import { generateVerificationToken, TokenType, sendVerificationEmail } from "@/auth/token";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ResetPasswordError = {
	email?: string[] | undefined;
};
export type ResetPasswordServerError = {
	message?: ResetPasswordError | string;
};

export default async function resetPasswordAction(prevState: ResetPasswordServerError, formData: FormData): Promise<ResetPasswordServerError> {
	if (!verifyHCaptcha(formData.get("h-captcha-response"))) {
		return {
			message: "Captcha verification failed. Please try again",
		};
	}

	const schema = z.string().trim().min(1, "Required").email("Invalid email");
	const parse = schema.safeParse(formData.get("email"));

	if (!parse.success) return { message: { email: parse.error.formErrors.fieldErrors[0] } };

	let result;
	try {
		result = await prisma.user.findUnique({
			where: {
				email: parse.data.toLowerCase(),
			},
			select: {
				id: true,
				first_name: true,
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Internal server error" };
	}

	if (!result) return { message: { email: ["Email not found"] } };

	const token = await generateVerificationToken(result.id, TokenType.PASSWORD);

	if (token === false) throw "internal error";

	const emailResult = await sendVerificationEmail(parse.data, token, result.first_name, TokenType.PASSWORD);

	if (emailResult === true) redirect("/reset-password/inbox");

	return { message: emailResult };
}
