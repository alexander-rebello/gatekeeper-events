import prisma from "@/db/client";
import { validateRequest } from "@/auth/lucia";
import DiscountsTable from "./table";
import { redirect } from "next/navigation";

export default async function Discounts() {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewDiscountCodes")) redirect("/admin/overview");

	const result = await prisma.discount_code.findMany({
		where: {
			event_id: session.currentEventId,
		},
		orderBy: {
			created_at: "desc",
		},
		include: {
			status: {
				select: {
					value: true,
				},
			},
			_count: {
				select: {
					orders: true,
				},
			},
		},
	});

	const data = result.map((discount) => {
		return {
			id: discount.id,
			code: discount.code,
			value: discount.is_percentage ? `${Math.floor(discount.value * 10000) / 100}%` : `${discount.value}€`,
			isPercentage: discount.is_percentage,
			createdAt: discount.created_at,
			status: discount.status.value,
			orders: discount._count.orders,
		};
	});

	return <DiscountsTable data={data} canEdit={permissions.includes("editDiscountCodes")} />;
}
