import { checkEventId, eAnswer, iAnswer, isValidUUID, sAnswer, validateAccessToken } from "@/app/api/utils";
import { validateRequest } from "@/auth/lucia";
import { createTicket } from "@/auth/ticket";
import prisma from "@/db/client";
import { readFile } from "fs/promises";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ order: string }> }) {
	const params = await props.params;
	const { session, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!isValidUUID(params.order)) {
		return eAnswer("Invalid order ID", 400);
	}

	let result;
	try {
		result = await prisma.order.findUnique({
			where: {
				event_id: session.currentEventId,
				uuid: params.order,
			},
			select: {
				id: true,
				uuid: true,
				created_at: true,
				first_name: true,
				last_name: true,
				status: {
					select: {
						value: true,
					},
				},
				event: {
					select: {
						location: true,
						start_date: true,
						end_date: true,
						short_description: true,
						name: true,
						organizer: true,
						owner: {
							select: {
								first_name: true,
								last_name: true,
							},
						},
					},
				},
				tickets: {
					select: {
						uuid: true,
						name: true,
						ticketType: {
							select: {
								title: true,
								description: true,
							},
						},
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
		return eAnswer("Database error", 500);
	}

	if (result === null) return eAnswer("Order not found", 404);

	const info = {
		orderId: result.id,
		orderUUID: result.uuid,
		orderDate: result.created_at,
		organizer: result.event.organizer + " (" + result.event.owner.first_name + " " + result.event.owner.last_name + ")",
		location: result.event.location,
		startDate: result.event.start_date,
		endDate: result.event.end_date,
		eventDescription: result.event.short_description,
		title: result.event.name,
		email: "",
		name: result.first_name + " " + result.last_name,
	};

	const tickets = result.tickets.map((ticket) => ({
		code: ticket.uuid,
		name: ticket.name ?? "unspecified",
		type: ticket.ticketType.title,
		description: ticket.ticketType.description ?? "unspecified",
	}));

	const response = (await createTicket(tickets, info, true)) as string;

	const fileBuffer = await readFile(response);

	return new NextResponse(fileBuffer, {
		status: 200,
		headers: {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="tickets.zip"`,
		},
	});
}
