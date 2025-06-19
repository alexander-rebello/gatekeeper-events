import prisma from "@/db/client";
import EditTicketsModal, { Ticket } from "./modal";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";

async function getTicketData(eventId: number, id: number): Promise<Ticket> {
	const dataResult = await prisma.ticket_type.findUnique({
		where: {
			event_id: eventId,
			id,
		},
		select: {
			id: true,
			title: true,
			description: true,
			color: true,
			price: true,
			max_quantity: true,
			position: true,
			created_at: true,
			status: {
				select: {
					value: true,
				},
			},
		},
	});

	if (!dataResult) redirect("/admin/tickets");

	return {
		id: dataResult.id,
		title: dataResult.title,
		description: dataResult.description ?? "",
		color: dataResult.color,
		price: dataResult.price.toNumber(),
		maxQuantity: dataResult.max_quantity,
		status: dataResult.status.value,
		position: dataResult.position,
		createdAt: dataResult.created_at,
	};
}

export default async function Modal({ params }: { params: Promise<{ id: string }> }) {
	const args = await params;

	const id = parseInt(args.id);

	if (args.id !== "new" && (isNaN(id) || id + "" !== args.id)) redirect("/admin/discounts");

	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("editTicketTypes")) redirect("/admin/tickets");

	const data = args.id === "new" ? null : await getTicketData(session.currentEventId, id);

	return <EditTicketsModal data={data} />;
}
