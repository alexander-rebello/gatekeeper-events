"use server";
import { validateRequest } from "@/auth/lucia";
import { HEX_REGEX } from "@/components/utils";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EditUserServerResult = {
	message?: string;
};

export default async function editUserAction(prevState: EditUserServerResult, formData: FormData): Promise<EditUserServerResult> {
	const { session, permissions } = await validateRequest();

	if (!session) {
		redirect("/login");
	}

	if (session.currentEventId === null) redirect("/admin/events");

	const id = Number(formData.get("id"));
	if (isNaN(id) || id + "" !== formData.get("id") || id <= 0) return { message: "Invalid user id" };

	if (formData.get("action") === "delete") {
		if (!permissions.includes("removeUsers")) {
			return { message: "You do not have permission to remove user" };
		}
		try {
			await prisma.user_event_roles.delete({
				where: {
					user_id_event_id: {
						user_id: id,
						event_id: session.currentEventId,
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Could not delete user" };
		}
		revalidatePath("/admin/users");
		return { message: "success" };
	}

	const roleId = Number(formData.get("role"));

	if (isNaN(roleId) || roleId + "" !== formData.get("role") || roleId <= 0) return { message: "Invalid role id" };

	try {
		const role = await prisma.event_role.findUnique({
			where: {
				id: roleId,
			},
		});

		if (!role) return { message: "Invalid role id" };

		await prisma.user_event_roles.update({
			where: {
				user_id_event_id: {
					user_id: id,
					event_id: session.currentEventId,
				},
			},
			data: {
				role_id: role.id,
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Failed to update user role" };
	}

	revalidatePath("/admin/users");
	return { message: "success" };
}
