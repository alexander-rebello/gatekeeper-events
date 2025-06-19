"use server";

import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { z, ZodIssueCode } from "zod";
import bcrypt from "bcryptjs";

export type PasswordActionError = {
	newPassword?: string[] | undefined;
	confirmPassword?: string[] | undefined;
};

export type PasswordServerResult = {
	message?: PasswordActionError | string;
};

export async function editUserPasswordAction(prevState: PasswordServerResult, formData: FormData): Promise<PasswordServerResult> {
	if (!formData.has("token")) return { message: "No token provided" };

	let user;
	try {
		user = await prisma.token.findFirst({
			where: {
				AND: [
					{
						token: {
							equals: formData.get("token") as string,
						},
					},
					{
						type: {
							is: {
								value: "PASSWORD",
							},
						},
					},
					{
						expires: {
							gt: new Date(),
						},
					},
				],
			},
			select: {
				user: {
					select: {
						password: true,
						id: true,
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
		return {
			message: "Internal server error. Please contact support.",
		};
	}

	if (!user) {
		console.error("Invalid token was used but not redirected by the client. This should never happen. (Password)");
		redirect("/reset-password/invalid");
	}

	const pwSchema = z
		.string()
		.min(8, "Minimum of 8 characters")
		.max(64, "Maximum of 64 characters")
		.regex(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, "Must contain numbers and symbols")
		.regex(/(?=.*[a-z])(?=.*[A-Z])/, "Must contain upper and lowercase letters");

	const schema = z
		.object({
			newPassword: pwSchema,
			confirmPassword: z.string().trim().min(1, "Required"),
		})
		.superRefine(async (d, ctx) => {
			if (await bcrypt.compare(d.newPassword, user.user.password)) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: "New password cannot be the same as old password",
					path: ["newPassword"],
				});
				return;
			}
			if (d.newPassword !== d.confirmPassword) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: "Passwords don't match",
					path: ["confirmPassword"],
				});
				return;
			}
		});

	const parse = await schema.safeParseAsync({
		newPassword: formData.get("newPassword"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!parse.success) {
		return {
			message: parse.error.formErrors.fieldErrors,
		};
	}

	try {
		await prisma.user.update({
			where: {
				id: user.user.id,
			},
			data: {
				password: await bcrypt.hash(parse.data.newPassword, 10),
			},
		});

		await prisma.token.deleteMany({
			where: {
				user_id: user.user.id,
				type: {
					value: "PASSWORD",
				},
			},
		});
	} catch (e) {
		console.error(e);
		return {
			message: "Failed to update password",
		};
	}

	return {
		message: "success",
	};
}
