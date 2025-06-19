"use server";

import { sendEmail } from "@/auth/email";
import { lucia, validateRequest } from "@/auth/lucia";
import prisma from "@/db/client";
import { redirect } from "next/navigation";
import { ZodIssueCode, z } from "zod";

export type EventSettingsError = {
	title?: string[] | undefined;
	token?: string[] | undefined;
	location?: string[] | undefined;
	eventStartDate?: string[] | undefined;
	eventEndDate?: string[] | undefined;
	shortDescription?: string[] | undefined;
	longDescription?: string[] | undefined;
};

export type EventSettingsServerResult = {
	message?: EventSettingsError | string;
};

export async function createNewEventAction(prevState: EventSettingsServerResult, formData: FormData): Promise<EventSettingsServerResult> {
	let internalServerError: boolean = false;

	const { session, user } = await validateRequest();

	if (!session) redirect("/login");

	const schema = z
		.object({
			title: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			token: z
				.string()
				.trim()
				.min(1, "Required")
				.min(4, "Minimum of 4 characters")
				.max(32, "Maximum of 32 characters")
				.regex(/^[a-zA-Z0-9]+$/, "Must be alphanumeric"),
			location: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			eventStartDate: z.string().trim().min(1, "Required"),
			eventEndDate: z.string().trim().min(1, "Required"),
			shortDescription: z.string().trim().min(1, "Required"),
		})
		.superRefine(async (d, ctx) => {
			if (
				z
					.string()
					.trim()
					.min(1, "Required")
					.min(4, "Minimum of 4 characters")
					.max(32, "Maximum of 32 characters")
					.regex(/^[a-zA-Z0-9]+$/, "Must be alphanumeric")
					.safeParse(d.token).success
			) {
				try {
					if (
						await prisma.event.findFirst({
							where: {
								token: d.token.toLowerCase(),
							},
						})
					)
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Token already in use",
							path: ["token"],
						});
				} catch (e) {
					console.error(e);
					internalServerError = true;
				}
			}

			const s = z.string().trim().min(1, "Required");
			const eventStartDateUTC = formData.get("eventStartDateUTC")?.toString();
			const eventEndDateUTC = formData.get("eventEndDateUTC")?.toString();

			if (s.safeParse(d.eventStartDate).success && s.safeParse(d.eventEndDate).success) {
				if (!eventStartDateUTC || !eventEndDateUTC) {
					if (!eventStartDateUTC) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Invalid start date",
							path: ["eventStartDate"],
						});
					}
					if (!eventEndDateUTC) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Invalid end date",
							path: ["eventEndDate"],
						});
					}
				} else if (new Date(eventStartDateUTC) >= new Date(eventEndDateUTC)) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "Start date must be before end date",
						path: ["eventStartDate"],
					});
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "End date must be after start date",
						path: ["eventEndDate"],
					});
				}
			}
		});

	const parse = await schema.safeParseAsync({
		title: formData.get("title"),
		token: formData.get("token"),
		location: formData.get("location"),
		eventStartDate: formData.get("eventStartDate"),
		eventEndDate: formData.get("eventEndDate"),
		shortDescription: formData.get("shortDescription"),
	});

	if (internalServerError) throw "internal error";

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	try {
		const newEvent = await prisma.event.create({
			data: {
				owner: {
					connect: {
						id: user.id,
					},
				},
				status: {
					connect: {
						value: "HIDDEN",
					},
				},
				token: parse.data.token.toLowerCase(),
				name: parse.data.title,
				short_description: parse.data.shortDescription,
				location: parse.data.location,
				start_date: new Date(formData.get("eventStartDateUTC")!.toString()),
				end_date: new Date(formData.get("eventEndDateUTC")!.toString()),
			},
			select: {
				id: true,
			},
		});

		await sendEmail({
			email: "alexander@rebello.eu",
			name: "Alexander Rebello",
			textContent: "A new event has been created.\n\n" + JSON.stringify({ ...parse.data, id: newEvent.id, user: user }),
			subject: "Gatekeeper - New User Signed Up",
		});

		await lucia.invalidateSession(session.id);
		await lucia.createSession(
			user.id,
			{
				currentEventId: newEvent.id,
			},
			{
				sessionId: session.id,
			}
		);
	} catch (e) {
		console.error(e);
		return { message: "Internal server error. Please try again. If the problem persists, contact support." };
	}

	redirect("/admin/overview");
}
