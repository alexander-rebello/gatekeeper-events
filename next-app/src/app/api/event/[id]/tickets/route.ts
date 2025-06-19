import { checkEventId, eAnswer, iAnswer, sAnswer, validateAccessToken } from "@/app/api/utils";
import prisma from "@/db/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = await validateAccessToken(request);

    if (typeof userId !== "number") return userId;

    const eventId = await checkEventId(params.id, userId);

    if (typeof eventId !== "number") return eventId;

    let tickets;
    try {
		tickets = await prisma.ticket.findMany({
			where: {
				order: {
					event_id: eventId,
				},
			},
			select: {
				used: true,
				ticket_type_id: true,
				uuid: true,
				name: true,
				order_id: true,
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

    if (tickets.length === 0) {
		return eAnswer("No tickets have been ordered", 200);
	}

    return sAnswer(
		tickets.map((ticket) => ({
			...ticket,
			code: ticket.uuid,
			uuid: undefined,
		}))
	);
}
