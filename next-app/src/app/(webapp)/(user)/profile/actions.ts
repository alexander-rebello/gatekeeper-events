"use server";

import { validateRequest } from "@/auth/lucia";
import { ImageEditError } from "@/components/forms/image-drop";
import prisma from "@/db/client";
import { writeFile } from "fs/promises";
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { redirect } from "next/navigation";
import path from "path";
import { ZodIssueCode, z } from "zod";
import bcrypt from "bcryptjs";
import logoutAction from "@/auth/actions/logout-action";
import { revalidatePath } from "next/cache";

export type UserSettingsError = {
	firstName?: string[] | undefined;
	lastName?: string[] | undefined;
	email?: string[] | undefined;
};

export type UserSettingsServerResult = {
	message?: UserSettingsError | string;
};

export type PasswordError = {
	oldPassword?: string[] | undefined;
	newPassword?: string[] | undefined;
	confirmPassword?: string[] | undefined;
};

export type PasswordServerResult = {
	message?: PasswordError | string;
};

export async function editUserImageAction(prevState: ImageEditError, formData: FormData): Promise<ImageEditError> {
	const { session, user } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const file = (formData.get("file") as File) || undefined;

	if (file === undefined || file.size === 0) {
		let userResult;
		try {
			userResult = await prisma.user.findUnique({
				where: {
					id: user.id,
				},
				select: {
					image: true,
				},
			});

			if (userResult === null) return { message: "No user found" };

			if (userResult.image === null) return { message: "No image found" };

			await prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					image: null,
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to remove image" };
		}

		removeProfilePicture(userResult.image, user.uuid);
		return { message: "success" };
	}

	// if file size is bigger than 5mb
	if (file.size > 5000000) return { message: "File must be less than 5mb" };

	if (!["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) return { message: "File must be a png, jpg, jpeg, webp or gif" };

	const buffer = Buffer.from(await file.arrayBuffer());

	const newPath = path.join(process.cwd(), "public", "uploads", "users");
	const newFileName = user.uuid + path.extname(file.name);

	if (!existsSync(newPath)) {
		mkdirSync(newPath, { recursive: true });
	}

	try {
		await writeFile(path.join(newPath, newFileName), buffer);
	} catch (e) {
		console.error(e);
		return { message: "Failed to upload image" };
	}

	try {
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				image: newFileName,
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Failed to update image" };
	}

	revalidatePath("/");

	return { message: "success", url: process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/users/" + newFileName };
}

export async function deleteUserAction(prevState: string, formData: FormData): Promise<string> {
	if (formData.get("action") === null || formData.get("action") !== "delete") return "Invalid request";
	const { user } = await validateRequest();
	if (!user) redirect("/login");
	try {
		const activeEvents = await prisma.event.findMany({
			where: {
				AND: [
					{
						owner_id: user.id,
					},
					{
						end_date: {
							gte: new Date(),
						},
					},
				],
			},
			select: {
				name: true,
			},
		});

		if (activeEvents.length > 0) return "Cannot delete user with upcoming events. (" + activeEvents.map((e) => e.name).join(", ") + ")";

		const eStatus = await prisma.event_status.findFirst({
			where: {
				value: "DISABLED",
			},
			select: {
				id: true,
			},
		});

		if (!eStatus) return "Internal server error";

		await prisma.event.updateMany({
			where: {
				owner_id: user.id,
			},
			data: {
				status_id: eStatus.id,
			},
		});

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				status: {
					connect: {
						value: "DISABLED",
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
		return "Failed to delete user";
	}

	await logoutAction();
	return "success";
}

export async function editUserPasswordAction(prevState: PasswordServerResult, formData: FormData): Promise<PasswordServerResult> {
	let internalServerError: boolean = false;

	const { session, user } = await validateRequest();

	if (!session) redirect("/login");

	const pwSchema = z
		.string()
		.min(8, "Minimum of 8 characters")
		.max(64, "Maximum of 64 characters")
		.regex(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, "Must contain numbers and symbols")
		.regex(/(?=.*[a-z])(?=.*[A-Z])/, "Must contain upper and lowercase letters");

	const schema = z
		.object({
			oldPassword: z.string().trim().min(1, "Required"),
			newPassword: pwSchema,
			confirmPassword: z.string().trim().min(1, "Required"),
		})
		.superRefine(async (d, ctx) => {
			if (d.newPassword === d.oldPassword) {
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
			if (pwSchema.safeParse(d.newPassword).success) {
				try {
					const userResult = await prisma.user.findUnique({
						where: {
							id: user.id,
						},
						select: {
							password: true,
						},
					});
					if (!userResult) {
						internalServerError = true;
						return;
					}
					if (!bcrypt.compareSync(d.oldPassword, userResult.password)) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Incorrect password",
							path: ["oldPassword"],
						});
					}
				} catch (e) {
					console.error(e);
					internalServerError = true;
				}
			}
		});

	const parse = await schema.safeParseAsync({
		oldPassword: formData.get("oldPassword"),
		newPassword: formData.get("newPassword"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (internalServerError) {
		return {
			message: "Internal server error",
		};
	}

	if (!parse.success) {
		return {
			message: parse.error.formErrors.fieldErrors,
		};
	}

	try {
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				password: await bcrypt.hash(parse.data.newPassword, 10),
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

export async function editUserSettingsAction(prevState: UserSettingsServerResult, formData: FormData): Promise<UserSettingsServerResult> {
	let internalServerError: boolean = false;

	const { user } = await validateRequest();

	if (!user) redirect("/login");

	const schema = z
		.object({
			firstName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			lastName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			email: z.string().trim().min(1, "Required").email("Invalid email"),
		})
		.superRefine(async (d, ctx) => {
			if (z.string().trim().min(1, "Required").email("Invalid email").safeParse(d.email).success) {
				try {
					if (
						await prisma.user.findFirst({
							where: {
								email: d.email.toLowerCase(),
								NOT: {
									id: user.id,
								},
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
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		email: formData.get("email"),
	});

	if (internalServerError) throw "internal error";

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	try {
		await prisma.user.update({
			where: {
				id: user.id,
				status: {
					isNot: {
						value: "DEACTIVATED",
					},
				},
			},
			data: {
				first_name: parse.data.firstName,
				last_name: parse.data.lastName,
				email: parse.data.email.toLowerCase(),
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Internal server error. Please try again. If the problem persists, contact support." };
	}

	return { message: "success" };
}

function removeProfilePicture(oldFileName: string, uuid: string) {
	const oldPath = path.join(process.cwd(), "public", "uploads", "users");
	const newPath = path.join(process.cwd(), "private", "storage", "users", uuid);
	const newFileName = Date.now().toString() + path.extname(oldFileName);

	if (!existsSync(oldPath)) return;

	if (!existsSync(newPath)) {
		mkdirSync(newPath, { recursive: true });
	}

	copyFileSync(path.join(oldPath, oldFileName), path.join(newPath, newFileName));
	unlinkSync(path.join(newPath, newFileName));
}
