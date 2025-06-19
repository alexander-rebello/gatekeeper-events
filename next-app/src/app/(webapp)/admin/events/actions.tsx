"use server";
import { lucia, validateRequest } from "@/auth/lucia";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function chooseEventAction(prevState: string, formData: FormData) {
	const { session, user } = await validateRequest();

	if (!session) redirect("/login");

	const schema = z.object({
		eventId: z.string().uuid(),
		action: z.enum(["enable", "select"]),
	});

	const parse = schema.safeParse({
		eventId: formData.get("event"),
		action: formData.get("action"),
	});

	if (!parse.success) {
		console.error([parse.error.formErrors.fieldErrors.eventId?.join("; "), parse.error.formErrors.fieldErrors.action?.join("; ")].join("; "));
		return "Internal server error. Please try again. If the problem persists, contact support.";
	}

	const result = await prisma.event.findUnique({
		where: {
			uuid: parse.data.eventId,
			status: {
				NOT: {
					value: "DEACTIVATED",
				},
			},
			OR: [
				{
					owner_id: user.id,
				},
				{
					user_event_roles:{
						some: {
							user_id: user.id,
						}
					}
				},
			],
		},
		select: {
			id: true,
		},
	});

	if (result === null) {
		console.error("ChooseEvent Button was submitted without a valid event. This should never happen!");
		return "Internal server error. Please try again. If the problem persists, contact support.";
	}

	if (parse.data.action === "enable")
		await prisma.event.update({
			where: {
				uuid: parse.data.eventId,
				owner_id: user.id,
				status: {
					NOT: {
						value: "DEACTIVATED",
					},
				},
			},
			data: {
				status: {
					connect: {
						value: "HIDDEN",
					},
				},
			},
		});

	await lucia.invalidateSession(session.id);
	await lucia.createSession(
		user.id,
		{
			currentEventId: result.id,
		},
		{
			sessionId: session.id,
		}
	);

	redirect("/admin/overview");
}
