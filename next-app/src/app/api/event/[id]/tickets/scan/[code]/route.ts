import { checkEventId, eAnswer, iAnswer, isValidUUID, sAnswer, validateAccessToken } from "@/app/api/utils";
import prisma from "@/db/client";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ code: string; id: string }> }
) {
    const params = await props.params;
    const userId = await validateAccessToken(request);

    if (typeof userId !== "number") return userId;

    const eventId = await checkEventId(params.id, userId);

    if (typeof eventId !== "number") return eventId;

    if (!isValidUUID(params.code)) {
		return eAnswer("Invalid ticket code", 400);
	}

    let ticket;
    try {
		ticket = await prisma.ticket.findUnique({
			where: {
				uuid: params.code,
			},
			select: {
				name: true,
				used: true,
				order: {
					select: {
						id: true,
						event_id: true,
					},
				},
				ticket_type_id: true,
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

    if (ticket === null) {
		return eAnswer("Ticket not found", 404);
	}

    if (ticket.order.event_id !== eventId) {
		return eAnswer("Unauthorized, this ticket belongs to another event", 401);
	}

    try {
		await prisma.ticket.update({
			where: {
				uuid: params.code,
			},
			data: {
				used: new Date(),
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

    return sAnswer({
		name: ticket.name,
		used: ticket.used,
		orderId: ticket.order.id,
		ticketTypeId: ticket.ticket_type_id,
	});
}
