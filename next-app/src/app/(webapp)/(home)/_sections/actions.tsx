"use server";
import { sendEmail } from "@/auth/email";
import { verifyHCaptcha } from "@/auth/hcaptcha";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ContactServerError = {
	message: ContactActionError;
};

export type ContactActionError =
	| {
			name?: string[] | undefined;
			email?: string[] | undefined;
			message?: string[] | undefined;
			agreeToTerms?: string[] | undefined;
	  }
	| string
	| undefined;

export async function contactFormAction(prevState: ContactServerError, formData: FormData): Promise<ContactServerError> {
	if (!verifyHCaptcha(formData.get("h-captcha-response"))) {
		return {
			message: "Captcha verification failed. Please try again",
		};
	}

	const schema = z.object({
		name: z.string().trim().min(1, "Required"),
		email: z.string().trim().min(1, "Required").email("Invalid email"),
		message: z.string().trim().min(1, "Required"),
		agreeToTerms: z.literal("on"),
	});

	const parse = await schema.safeParseAsync({
		name: formData.get("name"),
		email: formData.get("email"),
		message: formData.get("message"),
		agreeToTerms: formData.get("agreeToTerms"),
	});

	if (!parse.success)
		return {
			message: parse.error.formErrors.fieldErrors,
		};

	try {
		await prisma.contact.create({
			data: {
				name: parse.data.name,
				email: parse.data.email.toLowerCase(),
				message: parse.data.message,
			},
		});
	} catch {
		return {
			message: "Internal Server Error. Please try again",
		};
	}

	const result = await sendEmail({
		name: "Alexander Rebello",
		email: "alexander@rebello.eu",
		subject: "Gatekeeper - Contact Form",
		textContent: `A contact form has been submitted by ${parse.data.name} (${parse.data.email}):\n\n${parse.data.message}`,
	});

	if (result !== true) console.error(result);

	return {
		message: "success",
	};
}
