"use server";
import { checkSuperAdmin, validateRequest } from "@/auth/lucia";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

export type EditUserServerResult = {
	message?:
		| {
				firstName?: string[] | undefined;
				lastName?: string[] | undefined;
				email?: string[] | undefined;
				status?: string[] | undefined;
		  }
		| string;
};

export default async function editUserAction(prevState: EditUserServerResult, formData: FormData): Promise<EditUserServerResult> {
	const { session } = await checkSuperAdmin();

	if (!session) redirect("/login");

	const id = formData.get("id")?.toString() || "";
	if ((formData.get("action") === "delete" && formData.get("id") === "new") || (formData.get("id") !== "new" && !id)) return { message: "Invalid user id" };

	if (formData.get("action") === "delete") {
		try {
			// Check if user has any tickets or orders before deletion
			const check = await prisma.event.findFirst({
				where: {
					owner: {
						uuid: id,
					},
				},
			});

			if (check) return { message: "User has tickets or orders and cannot be deleted" };

			await prisma.user.delete({
				where: {
					uuid: id,
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Could not delete user" };
		}
		redirect("/superadmin/users");
	}

	const schema = z.object({
		firstName: z.string().trim().min(1, "Required").max(50, "Maximum of 50 characters"),
		lastName: z.string().trim().min(1, "Required").max(50, "Maximum of 50 characters"),
		email: z.string().trim().email("Must be a valid email address"),
		status: z.enum(["ACTIVE", "DISABLED"], { message: "Invalid status" }),
	});

	const parse = await schema.safeParseAsync({
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		email: formData.get("email"),
		status: formData.get("status"),
	});

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	if (formData.get("id") === "new") {
		try {
			// Check if email already exists
			const existingUser = await prisma.user.findUnique({
				where: {
					email: parse.data.email,
				},
			});

			if (existingUser) return { message: "A user with this email already exists" };

			const tempPassword = Math.random().toString(36).slice(-10);
			const hashedPassword = await bcrypt.hash(tempPassword, 10);

			await prisma.user.create({
				data: {
					first_name: parse.data.firstName,
					last_name: parse.data.lastName,
					email: parse.data.email,
					password: hashedPassword,
					status: {
						connect: {
							value: parse.data.status,
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to create user" };
		}
	} else {
		try {
			await prisma.user.update({
				where: {
					uuid: id,
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
				data: {
					first_name: parse.data.firstName,
					last_name: parse.data.lastName,
					email: parse.data.email,
					status: {
						connect: {
							value: parse.data.status,
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to update user" };
		}

		revalidatePath("/");
	}
	redirect("/superadmin/users");
}
