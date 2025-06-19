"use server";
import { validateRequest } from "@/auth/lucia";
import { HEX_REGEX } from "@/components/utils";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EditTicketServerResult = {
	message?:
		| {
				title?: string[] | undefined;
				description?: string[] | undefined;
				color?: string[] | undefined;
				price?: string[] | undefined;
				maxQuantity?: string[] | undefined;
				status?: string[] | undefined;
				position?: string[] | undefined;
		  }
		| string;
};

export default async function editTicketAction(prevState: EditTicketServerResult, formData: FormData): Promise<EditTicketServerResult> {
	const { session, permissions } = await validateRequest();

	if (!session) {
		redirect("/login");
	}

	if (session.currentEventId === null) redirect("/admin/events");

	const id = Number(formData.get("id"));
	if ((formData.get("action") === "delete" && formData.get("id") === "new") || (formData.get("id") !== "new" && (isNaN(id) || id + "" !== formData.get("id") || id <= 0))) return { message: "Invalid t id" };

	if (formData.get("action") === "delete") {
		if (!permissions.includes("deleteTicketTypes")) {
			return { message: "You do not have permission to delete ticket types" };
		}
		try {
			const check = await prisma.ticket.findFirst({
				where: {
					ticket_type_id: id,
				},
			});

			if (check) return { message: "Ticket is part of an order and cannot be deleted" };

			await prisma.ticket_type.delete({
				where: {
					event_id: session.currentEventId,
					id: id,
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Could not delete ticket" };
		}
		revalidatePath("/admin/tickets");
		return { message: "success" };
	}

	const schema = z.object({
		title: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
		description: z.string().trim().max(256, "Maximum of 256 characters"),
		color: z.string().trim().regex(HEX_REGEX, "Only hexadecimal values allowed"),
		price: z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().positive("Invalid Value")),
		maxQuantity: z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().int("Must be an integer").min(0, "Must be 0 or greater")),
		position: z
			.string()
			.regex(/^[-]?\d*\.?\d+$/, "Must be a number")
			.pipe(z.coerce.number().int("Must be an integer").positive("Must be a positive number")),
		status: z.string().trim().min(1, "Required"),
	});

	const parse = await schema.safeParseAsync({
		title: formData.get("title"),
		description: formData.get("description"),
		color: formData.get("color"),
		price: formData.get("price"),
		maxQuantity: formData.get("maxQuantity"),
		position: formData.get("position"),
		status: formData.get("status"),
	});

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	if (formData.get("id") === "new") {
		try {
			await prisma.ticket_type.create({
				data: {
					event: {
						connect: {
							id: session.currentEventId!,
						},
					},
					status: {
						connect: {
							value: parse.data.status,
						},
					},
					title: parse.data.title,
					description: parse.data.description === "" ? null : parse.data.description,
					color: parse.data.color,
					price: Math.floor(parse.data.price * 100) / 100,
					max_quantity: parse.data.maxQuantity,
					position: parse.data.position,
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to create ticket" };
		}
	} else {
		try {
			await prisma.ticket_type.update({
				where: {
					event_id: session.currentEventId,
					id: id,
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
				data: {
					title: parse.data.title,
					description: parse.data.description === "" ? null : parse.data.description,
					color: parse.data.color,
					price: Math.floor(parse.data.price * 100) / 100,
					max_quantity: parse.data.maxQuantity,
					position: parse.data.position,
					status: {
						connect: {
							value: parse.data.status,
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to update ticket type" };
		}
	}
	revalidatePath("/admin/tickets");
	return { message: "success" };
}
