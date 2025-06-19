import prisma from "@/db/client";
import EditDiscountCodeModal, { DiscountCode } from "./modal";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";

async function getDiscountCodeData(eventId: number, code: string): Promise<DiscountCode> {
	const dataResult = await prisma.discount_code.findUnique({
		where: {
			code_event_id: {
				code: code,
				event_id: eventId,
			},
		},
		select: {
			code: true,
			value: true,
			is_percentage: true,
			created_at: true,
			status: {
				select: {
					value: true,
				},
			},
		},
	});

	if (!dataResult) redirect("/admin/discounts");

	return {
		code: dataResult.code,
		value: dataResult.value,
		isPercentage: dataResult.is_percentage,
		status: dataResult.status.value,
		createdAt: dataResult.created_at,
	};
}

export default async function Modal(props: { params: Promise<{ code: string }> }) {
    const params = await props.params;
    const { session, permissions } = await validateRequest(true);

    if (!session) redirect("/login");

    if (session.currentEventId === null) redirect("/admin/events");

    if ((params.code !== "new" && !permissions.includes("editDiscountCodes")) || (params.code === "new" && !permissions.includes("createDiscountCodes"))) redirect("/admin/discounts");

    const data = params.code === "new" ? null : await getDiscountCodeData(session.currentEventId, params.code);

    return <EditDiscountCodeModal data={data} />;
}
