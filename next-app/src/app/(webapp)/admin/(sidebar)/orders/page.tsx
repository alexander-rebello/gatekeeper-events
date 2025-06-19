import prisma from "@/db/client";
import { validateRequest } from "@/auth/lucia";
import OrderTable from "./table";
import { redirect } from "next/navigation";

export default async function Orders() {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewOrders")) redirect("/admin/overview");

	const result = await prisma.order_info.findMany({
		where: {
			event_id: session.currentEventId,
		},
		orderBy: {
			created_at: "desc",
		},
		select: {
			uuid: true,
			name: true,
			email: true,
			created_at: true,
			quantity: true,
			sum: true,
			status: true,
			tickets_delivered: true,
		},
	});

	const data = result.map((order) => {
		return {
			...order,
			tickets_delivered: order.tickets_delivered !== null,
			sum: Math.floor((order.sum?.toNumber() ?? 0) * 100) / 100,
			date: order.created_at,
			created_at: undefined,
		};
	});

	return <OrderTable data={data} canView={permissions.includes("viewOrdersSingle")} />;
}
