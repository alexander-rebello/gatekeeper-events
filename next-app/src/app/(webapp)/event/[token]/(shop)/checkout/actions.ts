"use server";
import { sendConfirmationEmail } from "@/auth/order";
import { isAlphaNumeric } from "@/components/utils";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { z } from "zod";

export type DiscountCodeResult = DiscountCodeAnswer | number | undefined;

export type DiscountCodeAnswer = {
	value: number;
	isPercentage: boolean;
};

export async function getDiscountCodeAction(prevState: DiscountCodeResult, formData: FormData): Promise<DiscountCodeResult> {
	const code = formData.get("code")?.toString() ?? "";
	const uuid = formData.get("uuid")?.toString() ?? "";

	const newErrNum = typeof prevState === "number" ? prevState - 1 : -1;

	const result = await validateDiscountCode(code, uuid);

	if (result === false) {
		return newErrNum;
	} else {
		return result;
	}
}

async function validateDiscountCode(code: string, uuid: string): Promise<DiscountCodeAnswer | false> {
	code = code.trim();

	if (!code || !isAlphaNumeric(code)) return false;

	uuid = uuid.trim();
	if (!uuid || !/^[a-zA-Z0-9\-]+$/.test(uuid)) return false;

	let discountCode;

	try {
		discountCode = await prisma.discount_code.findFirst({
			where: {
				code: code,
				event: {
					uuid: uuid,
				},
				status: {
					value: "ACTIVE",
				},
			},
			select: {
				value: true,
				is_percentage: true,
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	if (!discountCode) return false;

	return {
		value: discountCode.value,
		isPercentage: discountCode.is_percentage,
	};
}

export type OrderResult = {
	error?: string;
};

export async function orderAction(prevState: OrderResult, formData: FormData): Promise<OrderResult> {
	if (!formData.get("uuid")) return { error: "Missing uuid" };
	const uuid = formData.get("uuid")!.toString();

	if (!formData.get("firstName")) return { error: "Missing first name" };
	const firstName = formData.get("firstName")!.toString();

	if (!formData.get("lastName")) return { error: "Missing last name" };
	const lastName = formData.get("lastName")!.toString();

	if (!formData.get("email")) return { error: "Missing email" };
	const email = formData.get("email")!.toString();

	const discountCode = formData.get("discount")?.toString() ?? undefined;

	let combinedCart: { ticketTypeId: number; amount: number; names: string[] }[] = [];

	try {
		if (!formData.get("ticketNames")) return { error: "Missing ticket names" };
		const ticketNames = JSON.parse(formData.get("ticketNames")!.toString());

		if (!z.array(z.object({ id: z.number().positive(), names: z.array(z.string()) })).safeParse(ticketNames).success) return { error: "Invalid ticket names" };

		if (!formData.get("cart")) return { error: "Missing cart" };
		const cart = JSON.parse(formData.get("cart")!.toString());

		if (!z.array(z.object({ id: z.number().positive(), amount: z.number().positive() })).safeParse(cart).success) return { error: "Invalid cart" };

		combinedCart = cart.map((ticket: { id: number; amount: number }) => {
			let nameList: string[] = ticketNames.find((ticketName: { id: number }) => ticketName.id === ticket.id)!.names;
			if (ticket.amount > nameList.length) nameList = nameList.concat(new Array(ticket.amount - nameList.length).fill(""));
			else if (ticket.amount < nameList.length) nameList = nameList.slice(0, ticket.amount);
			return {
				ticketTypeId: ticket.id,
				amount: ticket.amount,
				names: nameList,
			};
		});
	} catch (error) {
		console.error(error);
		return { error: "Invalid form data" };
	}

	let event;

	try {
		event = await prisma.event.findUnique({
			where: {
				uuid: uuid,
				status: {
					value: "PUBLIC",
				},
			},
			select: {
				id: true,
				token: true,
				sale_start_date: true,
				sale_end_date: true,
				start_date: true,
				tickets: {
					where: {
						status: {
							value: "ACTIVE",
						},
					},
					select: {
						id: true,
						_count: {
							select: {
								tickets: true,
							},
						},
						max_quantity: true,
					},
				},
				discount_codes: {
					where: {
						status: {
							value: "ACTIVE",
						},
						code: discountCode === undefined ? "" : discountCode,
					},
					select: {
						value: true,
						is_percentage: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return { error: "Failed to get event" };
	}

	if (!event) return { error: "Event not found" };

	if (discountCode && event.discount_codes.length === 0) return { error: "Invalid discount code" };

	const now = new Date();

	if (event.sale_start_date && now < event.sale_start_date) return { error: "Sale has not started" };

	if (event.sale_end_date && now > event.sale_end_date) return { error: "Sale has ended" };

	if (now > event.start_date) return { error: "Sale has ended" };

	let processedCart: { ticket_type_id: number; name: string }[] = [];
	let error = "";

	combinedCart.forEach((item) => {
		const ticket = event.tickets.find((t) => t.id === item.ticketTypeId);
		if (!ticket) {
			error = "Invalid ticket";
			return;
		}
		if (ticket._count.tickets + item.amount > ticket.max_quantity && ticket.max_quantity > 0) {
			error = "Not enough tickets left";
			return;
		}
		for (let i = 0; i < item.amount; i++) {
			processedCart.push({
				ticket_type_id: item.ticketTypeId,
				name: item.names[i] ?? "",
			});
		}
	});

	if (error) return { error: error };

	let order;
	try {
		order = await prisma.order.create({
			data: {
				email: email.toLowerCase(),
				first_name: firstName,
				last_name: lastName,
				message: formData.get("message")?.toString() ?? null,
				event: {
					connect: {
						uuid: uuid,
					},
				},
				discount_code:
					discountCode !== undefined && discountCode.length > 0
						? {
								connect: {
									code_event_id: {
										code: discountCode,
										event_id: event.id,
									},
								},
						  }
						: undefined,
				tickets: {
					createMany: {
						data: processedCart,
					},
				},
			},
			select: {
				uuid: true,
				event: {
					select: {
						token: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return { error: "Failed to create order" };
	}

	sendConfirmationEmail(order.uuid);

	redirect("/event/" + order.event.token + "/success/" + order.uuid);
}
