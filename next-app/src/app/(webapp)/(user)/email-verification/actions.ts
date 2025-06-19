"use server";
import { validateRequest } from "@/auth/lucia";
import { generateVerificationToken, TokenType, sendVerificationEmail } from "@/auth/token";
import { redirect } from "next/navigation";

export type SendVerificationEmailResult = {
	error?: string;
	success?: string;
};

export async function sendVeryficationEmail(prevState: SendVerificationEmailResult, formData: FormData): Promise<SendVerificationEmailResult> {
	const { user, session } = await validateRequest();

	if (session === null) redirect("/login");

	const token = await generateVerificationToken(user.id, TokenType.EMAIL);

	if (token === false) return { error: "Internal Server Error. Please try again." };

	const sent = await sendVerificationEmail(user.email, token, user.firstName, TokenType.EMAIL);

	if (sent === true) return { success: "Verification email sent. Please check your email." };

	console.error(sent);
	return { error: "A Verification email could not be sent. Please contact support." };
}
