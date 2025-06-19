import prisma from "@/db/client";
import EditOrderModal, { DiscountCode, FullOrder, TicketType } from "./modal";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";
import { isValidUUID } from "@/app/api/utils";

async function getOrderData(eventId: number, uuid: string): Promise<FullOrder | false> {
	let dataResult;
	try {
		dataResult = await prisma.order.findUnique({
			where: {
				uuid: uuid,
				event_id: eventId,
			},
			select: {
				uuid: true,
				first_name: true,
				last_name: true,
				email: true,
				created_at: true,
				message: true,
				notes: true,
				discount_code: {
					select: {
						code: true,
						is_percentage: true,
						value: true,
					},
				},
				status: {
					select: {
						value: true,
					},
				},
				tickets: {
					select: {
						uuid: true,
						ticket_type_id: true,
						name: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	if (!dataResult) redirect("/admin/orders");

	return {
		...dataResult,
		status: dataResult.status.value,
	};
}

async function getTicketTypes(eventId: number): Promise<TicketType[] | false> {
	let ticketsResult;
	try {
		ticketsResult = await prisma.ticket_type.findMany({
			where: {
				event_id: eventId,
			},
			select: {
				id: true,
				title: true,
				price: true,
				color: true,
				max_quantity: true,
				status: {
					select: {
						value: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	return ticketsResult.map((ticket) => ({
		...ticket,
		price: Math.floor(ticket.price.toNumber() * 100) / 100,
		status: ticket.status.value,
	}));
}

async function getDiscountCodes(eventId: number): Promise<DiscountCode[] | false> {
	let result;
	try {
		result = await prisma.discount_code.findMany({
			where: {
				event_id: eventId,
				status: {
					NOT: [
						{
							value: "DEACTIVATED",
						},
						{
							value: "DISABLED",
						},
					],
				},
			},
			select: {
				code: true,
				is_percentage: true,
				value: true,
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	return result.map((d) => ({
		...d,
		value: d.is_percentage ? Math.floor(d.value * 1000) / 1000 : Math.floor(d.value * 100) / 100,
	}));
}

export default async function Modal(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	if (params.id !== "new" && !isValidUUID(params.id)) redirect("/admin/orders");

	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if ((params.id !== "new" && !permissions.includes("viewOrdersSingle")) || (params.id === "new" && !permissions.includes("createOrders"))) redirect("/admin/orders");

	const ticketTypes = await getTicketTypes(session.currentEventId);
	if (ticketTypes === false) redirect("/admin/orders");

	const data = params.id === "new" ? null : await getOrderData(session.currentEventId, params.id);
	if (data === false) redirect("/admin/orders");

	let discountCodes = await getDiscountCodes(session.currentEventId);
	if (discountCodes === false) redirect("/admin/orders");

	if (!permissions.includes("editOrders")) {
		if (data && data.discount_code) discountCodes = [data.discount_code];
		else discountCodes = [];
	}

	return <EditOrderModal data={data} ticketTypes={ticketTypes} discountCodes={discountCodes} canEdit={permissions.includes("editOrders")} canDelete={permissions.includes("deleteOrders")} canSendTickets={permissions.includes("sendTickets")} />;
}
