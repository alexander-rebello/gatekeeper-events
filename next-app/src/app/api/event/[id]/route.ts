import { checkEventId, iAnswer, sAnswer, validateAccessToken } from "@/app/api/utils";
import prisma from "@/db/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = await validateAccessToken(request);

    if (typeof userId !== "number") return userId;

    const eventId = await checkEventId(params.id, userId);

    if (typeof eventId !== "number") return eventId;

    let event;
    try {
		event = await prisma.event.findUnique({
			where: {
				id: eventId,
			},
			select: {
				id: true,
				uuid: true,
				name: true,
				main_image: true,
				short_description: true,
				long_description: true,
				location: true,
				start_date: true,
				end_date: true,
				sale_start_date: true,
				sale_end_date: true,
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

    if (event === null) {
		return iAnswer();
	}

    const detailedEvent = {
		...event,
		mainImage: process.env.NEXT_PUBLIC_PUBLIC_URL + (event.main_image ? `/uploads/events/${event.uuid}/${event.main_image}` : "/img/placeholder.webp"),
		id: undefined,
	};

    return sAnswer(detailedEvent);
}
