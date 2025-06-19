import prisma from "@/db/client";
import { z, ZodIssueCode } from "zod";
import bcrypt from "bcryptjs";
import { createFullSession } from "../lucia";
import { generateVerificationToken, sendVerificationEmail, TokenType } from "../token";
import { sendEmail } from "../email";

export type SignupActionError =
	| {
			email?: string[] | undefined;
			password?: string[] | undefined;
			confirmPassword?: string[] | undefined;
			firstName?: string[] | undefined;
			lastName?: string[] | undefined;
			agreeToTerms?: string[] | undefined;
	  }
	| string
	| undefined;

export type SignupData = {
	email: FormDataEntryValue | null;
	password: FormDataEntryValue | null;
	confirmPassword: FormDataEntryValue | null;
	firstName: FormDataEntryValue | null;
	lastName: FormDataEntryValue | null;
	agreeToTerms: FormDataEntryValue | null;
};

export default async function signup(data: SignupData): Promise<SignupActionError> {
	let internalServerError: boolean = false;

	const schema = z
		.object({
			email: z.string().trim().min(1, "Required").email("Invalid email").max(64, "Maximum of 64 characters"),
			password: z
				.string()
				.min(8, "Minimum of 8 characters")
				.max(64, "Maximum of 64 characters")
				.regex(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, "Must contain numbers and symbols")
				.regex(/(?=.*[a-z])(?=.*[A-Z])/, "Must contain upper and lowercase letters"),
			confirmPassword: z.string().min(1, "Required"),
			firstName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			lastName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			agreeToTerms: z.literal("on"),
		})
		.refine((d) => d.password === d.confirmPassword, {
			message: "Passwords don't match",
			path: ["confirmPassword"],
		})
		.superRefine(async (d, ctx) => {
			if (z.string().trim().min(1).email().max(64).safeParse(d.email).success) {
				try {
					if (
						await prisma.user.findUnique({
							where: {
								email: d.email.toLowerCase(),
							},
						})
					)
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Email already in use",
							path: ["email"],
						});
				} catch (e) {
					console.error(e);
					internalServerError = true;
				}
			}
		});

	const parse = await schema.safeParseAsync({
		email: data.email,
		password: data.password,
		confirmPassword: data.confirmPassword,
		firstName: data.firstName,
		lastName: data.lastName,
		agreeToTerms: data.agreeToTerms,
	});

	if (internalServerError) throw "Internal Server Error. Please try again.";

	if (!parse.success) return parse.error.formErrors.fieldErrors;

	try {
		const user = await prisma.user.create({
			data: {
				email: parse.data.email.toLowerCase(),
				password: await bcrypt.hash(parse.data.password, 10),
				first_name: parse.data.firstName,
				last_name: parse.data.lastName,
			},
			select: {
				id: true,
				uuid: true,
				first_name: true,
				last_name: true,
				email: true,
				email_verified: true,
			},
		});

		await sendEmail({
			email: "alexander@rebello.eu",
			name: "Alexander Rebello",
			textContent: "A new user has signed up.\n\n" + JSON.stringify(user),
			subject: "Gatekeeper - New User Signed Up",
		});

		await createFullSession({
			id: user.id,
			uuid: user.uuid,
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email.toLowerCase(),
			emailVerified: user.email_verified !== null,
		});

		const token = await generateVerificationToken(user.id, TokenType.EMAIL);

		if (token === false) throw "internal error";

		if ((await sendVerificationEmail(parse.data.email, token, user.first_name, TokenType.EMAIL)) === true) return undefined;

		return "Email could not be sent. Please contact support.";
	} catch (e) {
		console.error(e);
		return "Internal Server Error. Please try again.";
	}
}
