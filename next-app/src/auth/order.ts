import { formatDate } from "@/components/utils";
import { sendEmail } from "./email";
import path from "path";
import { promises } from "fs";
import prisma from "@/db/client";

export async function sendConfirmationEmail(uuid: string, email?: string): Promise<boolean> {
	let order;

	try {
		order = await prisma.order.findUniqueOrThrow({
			where: {
				uuid: uuid,
			},
			select: {
				email: true,
				first_name: true,
				last_name: true,
				tickets: {
					select: {
						name: true,
						ticketType: {
							select: {
								title: true,
								price: true,
							},
						},
					},
				},
				discount_code: {
					select: {
						value: true,
						is_percentage: true,
					},
				},
				event: {
					select: {
						name: true,
						start_date: true,
						end_date: true,
						sale_end_date: true,
						payment_link: true,
						bank: true,
						location: true,
						organizer: true,
						owner: {
							select: {
								first_name: true,
								last_name: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	let rows = "",
		discount = "";
	try {
		const itemRow = await promises.readFile(path.join(process.cwd(), "private", "email", "order-confirmation-row.html"), "utf8");

		order.tickets.forEach((ticket) => {
			rows += itemRow
				.replace("{{ITEM}}", ticket.ticketType.title)
				.replace("{{NAME}}", ticket.name !== null && ticket.name.length > 0 ? ticket.name : "---")
				.replace("{{PRICE}}", ticket.ticketType.price.toFixed(2).replace(".", ",").replace(",00", ",-").toString());
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	if (order.discount_code != null) {
		try {
			const discountRow = await promises.readFile(path.join(process.cwd(), "private", "email", "order-confirmation-discount.html"), "utf8");

			discount = discountRow.replace("{{DISCOUNT}}", order.discount_code.is_percentage ? `-${order.discount_code.value * 100}%` : `-${order.discount_code.value.toFixed(2).replace(".", ",").replace(",00", ",-")} €`);
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	const total = order.tickets.reduce((a, b) => a + b.ticketType.price.toNumber(), 0);

	const discounted = order.discount_code == null ? total : order.discount_code.is_percentage ? total * (1 - order.discount_code.value) : total - order.discount_code.value;

	const result = await sendEmail({
		email: email ? email : order.email,
		name: order.first_name + " " + order.last_name,
		subject: "Bestellbestätigung " + order.event.name,
		textContent: "Vielen Dank für deine Bestellung. Die Bestellnummer lautet: " + uuid,
		html: {
			file: path.join(process.cwd(), "private", "email", "order-confirmation.html"),
			replacements: {
				NAME: order.first_name + " " + order.last_name,
				ROWS: rows,
				DISCOUNT: discount,
				ORDER_ID: uuid,
				TOTAL_PRICE: Math.max(0, discounted).toFixed(2).replace(".", ",").replace(",00", ",-"),
				SIGNATURE: order.event.organizer,
				PAYMENT: (order.event.payment_link ? `Link: <a href='${order.event.payment_link}'>${order.event.payment_link}</a>` : "") + (order.event.bank && order.event.payment_link ? "<br>" : "") + (order.event.bank ? `Bank: ${order.event.bank}` : ""),
				EVENT: order.event.name,
				LOCATION: order.event.location,
				START: formatDate(order.event.start_date),
				END: formatDate(order.event.end_date),
				SALE_END: formatDate(order.event.sale_end_date || order.event.end_date),
			} as Record<string, string>,
		},
	});

	return result === true;
}
