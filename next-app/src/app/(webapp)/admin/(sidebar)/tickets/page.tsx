import prisma from "@/db/client";
import { validateRequest } from "@/auth/lucia";
import TicketsTable from "./table";
import { redirect } from "next/navigation";

export default async function Tickets() {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewTicketTypes")) redirect("/admin/overview");

	const result = await prisma.tickets_sold.findMany({
		where: {
			event_id: session.currentEventId,
		},
		orderBy: [
			{
				position: "asc",
			},
			{
				created_at: "asc",
			},
		],
		select: {
			id: true,
			title: true,
			quantity: true,
			color: true,
			max_quantity: true,
			price: true,
			status: true,
		},
	});

	const data = result.map((ticket) => {
		return {
			...ticket,
			price: ticket.price.toNumber(),
			quantity: ticket.quantity,
		};
	});

	return <TicketsTable data={data} canEdit={permissions.includes("editTicketTypes")} />;
}
