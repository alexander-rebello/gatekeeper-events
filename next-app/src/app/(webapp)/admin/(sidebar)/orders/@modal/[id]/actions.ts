"use server";
import { sendConfirmationEmail } from "@/auth/order";
import { isValidUUID } from "@/app/api/utils";
import { validateRequest } from "@/auth/lucia";
import { sendTickets } from "@/auth/ticket";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodIssueCode, z } from "zod";

export type EditOrderServerResult = {
	message?:
		| {
				email?: string[] | undefined;
				firstName?: string[] | undefined;
				lastName?: string[] | undefined;
				status?: string[] | undefined;
				tickets?: string[] | undefined;
				discountCode?: string[] | undefined;
		  }
		| string;
};

export async function editOrderAction(prevState: EditOrderServerResult, formData: FormData): Promise<EditOrderServerResult> {
	const { session, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const uuid = formData.get("uuid")?.toString();

	if (uuid === undefined || (!isValidUUID(uuid) && uuid !== "new")) return { message: "Invalid o id" };

	if (formData.get("action") === "delete") {
		if (!permissions.includes("deleteOrders")) return { message: "You do not have permission to delete orders" };

		if (uuid === "new") return { message: "Cannot delete new order" };
		try {
			await prisma.order.delete({
				where: {
					event_id: session.currentEventId,
					uuid: uuid,
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Could not delete order" };
		}
		revalidatePath("/admin/orders");
		return { message: "success" };
	}

	if (uuid !== "new" && !permissions.includes("editOrders")) return { message: "You do not have permission to edit orders" };
	if (uuid === "new" && !permissions.includes("createOrders")) return { message: "You do not have permission to create orders" };

	const schema = z
		.object({
			firstName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			lastName: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			email: z.string().trim().min(1, "Required").email("Invalid email").max(64, "Maximum of 64 characters"),
			status: z.string().min(1, "Required"),
			discountCode: z.string(),
			tickets: z.array(z.object({ uuid: z.string().uuid("Invalid uuid"), name: z.string().min(1, "Required"), ticket_type_id: z.number().positive("Invalid tt id") })).nonempty("Required"),
		})
		.superRefine(async (d, ctx) => {
			if (d.discountCode !== "") {
				try {
					const result = await prisma.discount_code.findUnique({
						where: {
							code_event_id: {
								code: d.discountCode,
								event_id: session.currentEventId!,
							},
						},
					});
					if (!result)
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Discount Code does not exist",
							path: ["discountCode"],
						});
				} catch (e) {
					console.error(e);
				}
			}

			const ticketTypes = await prisma.ticket_type.findMany({
				where: {
					event_id: session.currentEventId!,
					status: {
						OR: [
							{
								value: "ACTIVE",
							},
							{
								value: "HIDDEN",
							},
						],
					},
				},
				select: {
					id: true,
				},
			});

			for (const ticket of d.tickets) {
				if (!ticketTypes.find((t) => t.id === ticket.ticket_type_id)) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "Ticket Type does not exist or is not active",
						path: ["tickets"],
					});
					break;
				}
			}
		});

	const parse = await schema.safeParseAsync({
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		email: formData.get("email"),
		status: formData.get("status"),
		discountCode: formData.get("discountCode"),
		tickets: JSON.parse(formData.get("tickets")?.toString() ?? "{}"),
	});

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	if (uuid === "new") {
		try {
			await prisma.order.create({
				data: {
					event: {
						connect: {
							id: session.currentEventId!,
						},
					},
					first_name: parse.data.firstName,
					last_name: parse.data.lastName,
					email: parse.data.email.toLowerCase(),
					notes: formData.get("notes") ? (formData.get("notes") as string) : null,
					status: {
						connect: {
							value: parse.data.status,
						},
					},
					discount_code: parse.data.discountCode
						? {
								connect: {
									code_event_id: {
										code: parse.data.discountCode,
										event_id: session.currentEventId!,
									},
								},
						  }
						: undefined,
					tickets: {
						createMany: {
							data: parse.data.tickets.map((ticket) => ({
								ticket_type_id: ticket.ticket_type_id,
								name: ticket.name,
							})),
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to create order" };
		}
	} else {
		try {
			await prisma.ticket.deleteMany({
				where: {
					uuid: {
						notIn: parse.data.tickets.map((ticket) => ticket.uuid),
					},
					order: {
						event_id: session.currentEventId,
						uuid: uuid,
					},
				},
			});

			await prisma.order.update({
				where: {
					event_id: session.currentEventId,
					uuid: uuid,
				},
				data: {
					first_name: parse.data.firstName,
					last_name: parse.data.lastName,
					email: parse.data.email.toLowerCase(),
					notes: formData.get("notes") ? (formData.get("notes") as string) : null,
					status: {
						connect: {
							value: parse.data.status,
						},
					},
					discount_code:
						parse.data.discountCode === ""
							? {
									disconnect: true,
							  }
							: {
									connect: {
										code_event_id: {
											code: parse.data.discountCode,
											event_id: session.currentEventId!,
										},
									},
							  },
					tickets: {
						upsert: parse.data.tickets.map((ticket) => ({
							where: {
								uuid: ticket.uuid,
							},
							create: {
								ticket_type_id: ticket.ticket_type_id,
								name: ticket.name ?? undefined,
							},
							update: {
								ticket_type_id: ticket.ticket_type_id,
								name: ticket.name ?? undefined,
							},
						})),
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to update Order" };
		}
	}
	revalidatePath("/admin/orders");
	return { message: "success" };
}

export async function deliverTicketsAction(prevState: string, formData: FormData): Promise<string> {
	const { session, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("sendTickets")) return "Permission denied";

	const uuid = formData.get("uuid")?.toString();
	if (uuid === undefined || !isValidUUID(uuid)) return "Invalid st id";

	const email = formData.get("email")?.toString();
	if (email === undefined || !z.string().email().safeParse(email).success) return "Invalid email";

	if (formData.get("action") === null || formData.get("action") !== "deliver") return "Invalid request";

	let result;
	try {
		result = await prisma.order.findUnique({
			where: {
				event_id: session.currentEventId,
				uuid: uuid,
			},
			select: {
				id: true,
				uuid: true,
				created_at: true,
				first_name: true,
				last_name: true,
				status: {
					select: {
						value: true,
					},
				},
				event: {
					select: {
						location: true,
						start_date: true,
						end_date: true,
						short_description: true,
						name: true,
						organizer: true,
						owner: {
							select: {
								first_name: true,
								last_name: true,
							},
						},
					},
				},
				tickets: {
					select: {
						uuid: true,
						name: true,
						ticketType: {
							select: {
								title: true,
								description: true,
							},
						},
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
		return "Failed to get order";
	}

	if (result === null) return "Order not found";

	const info = {
		orderId: result.id,
		orderUUID: result.uuid,
		orderDate: result.created_at,
		organizer: result.event.organizer + " (" + result.event.owner.first_name + " " + result.event.owner.last_name + ")",
		location: result.event.location,
		startDate: result.event.start_date,
		endDate: result.event.end_date,
		eventDescription: result.event.short_description,
		title: result.event.name,
		email: email,
		name: result.first_name + " " + result.last_name,
	};

	const tickets = result.tickets.map((ticket) => ({
		code: ticket.uuid,
		name: ticket.name ?? "unspecified",
		type: ticket.ticketType.title,
		description: ticket.ticketType.description ?? "unspecified",
	}));

	const response = await sendTickets(info, tickets);
	return response === true ? "success" : response;
}

export async function resendConfirmationAction(prevState: string, formData: FormData): Promise<string> {
	const { session } = await validateRequest();
	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const uuid = formData.get("uuid")?.toString();
	if (uuid === undefined || !isValidUUID(uuid)) return "Invalid st id";

	const email = formData.get("email")?.toString();
	if (email === undefined || !z.string().email().safeParse(email).success) return "Invalid email";

	if (formData.get("action") === null || formData.get("action") !== "resend") return "Invalid request";

	const result = await sendConfirmationEmail(uuid, email);

	return result === true ? "success" : "Internal error";
}
