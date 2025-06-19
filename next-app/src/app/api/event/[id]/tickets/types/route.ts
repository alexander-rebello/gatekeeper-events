import { checkEventId, eAnswer, iAnswer, sAnswer, validateAccessToken } from "@/app/api/utils";
import prisma from "@/db/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = await validateAccessToken(request);

    if (typeof userId !== "number") return userId;

    const eventId = await checkEventId(params.id, userId);

    if (typeof eventId !== "number") return eventId;

    let ticketTypes;
    try {
		ticketTypes = await prisma.ticket_type.findMany({
			where: {
				event_id: eventId,
			},
			select: {
				id: true,
				color: true,
				title: true,
				description: true,
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

    if (ticketTypes.length === 0) {
		return eAnswer("No ticket types have been created", 200);
	}

    return sAnswer(ticketTypes);
}
