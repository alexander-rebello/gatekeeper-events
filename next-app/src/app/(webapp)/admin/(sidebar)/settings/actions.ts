"use server";

import { lucia, validateRequest } from "@/auth/lucia";
import { ImageEditError } from "@/components/forms/image-drop";
import prisma from "@/db/client";
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { ZodIssueCode, z } from "zod";

export type EventSettingsError = {
	title?: string[] | undefined;
	location?: string[] | undefined;
	token?: string[] | undefined;
	eventStartDate?: string[] | undefined;
	eventEndDate?: string[] | undefined;
	sellStartDate?: string[] | undefined;
	sellEndDate?: string[] | undefined;
	shortDescription?: string[] | undefined;
	longDescription?: string[] | undefined;
	status?: string[] | undefined;
	bank?: string[] | undefined;
	paymentLink?: string[] | undefined;
};

export type EventSettingsServerResult = {
	message?: EventSettingsError | string;
};

export async function editEventSettingsAction(prevState: EventSettingsServerResult, formData: FormData): Promise<EventSettingsServerResult> {
	let internalServerError: boolean = false;

	const { session, user, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("editSettings")) return { message: "You do not have permission to edit settings." };

	const currentEventId = session.currentEventId;

	const schema = z
		.object({
			title: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			location: z.string().trim().min(1, "Required").max(32, "Maximum of 32 characters"),
			token: z
				.string()
				.trim()
				.min(1, "Required")
				.min(4, "Minimum of 4 characters")
				.max(32, "Maximum of 32 characters")
				.regex(/^[a-zA-Z0-9]+$/, "Must be alphanumeric"),
			eventStartDate: z.string().trim().min(1, "Required"),
			eventEndDate: z.string().trim().min(1, "Required"),
			saleStartDate: z.string(),
			saleEndDate: z.string(),
			shortDescription: z.string().trim().min(1, "Required").min(16, "Minimum of 16 characters").max(256, "Maximum of 256 characters"),
			longDescription: z
				.string()
				.trim()
				.max(1024, "Maximum of 1024 characters")
				.refine((value) => value.length === 0 || value.length >= 32, { message: "Minimum of 32 characters" }),
			status: z.string().min(1, "Required"),
			bank: z
				.string()
				.trim()
				.regex(/^([A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{1,2})?)?$/, "Must be a valid IBAN"),
			paymentLink: z.string().trim().max(32, "Maximum of 32 characters"),
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
								id: {
									not: {
										equals: currentEventId,
									},
								},
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

			if (d.saleStartDate !== "" && d.saleEndDate !== "") {
				const saleStartDateUTC = formData.get("saleStartDateUTC")?.toString();
				const saleEndDateUTC = formData.get("saleEndDateUTC")?.toString();

				if (!saleStartDateUTC || !saleEndDateUTC) {
					if (!saleStartDateUTC) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Invalid sale start date",
							path: ["saleStartDate"],
						});
					}
					if (!saleEndDateUTC) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: "Invalid sale end date",
							path: ["saleEndDate"],
						});
					}
				} else if (new Date(saleStartDateUTC) >= new Date(saleEndDateUTC)) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "Start date must be before end date",
						path: ["saleStartDate"],
					});
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "End date must be after start date",
						path: ["saleEndDate"],
					});
				} else if (eventStartDateUTC && new Date(saleEndDateUTC) >= new Date(eventStartDateUTC)) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: "Sale end date must be before event start date",
						path: ["saleEndDate"],
					});
				}
			}
		});

	const parse = await schema.safeParseAsync({
		title: formData.get("title"),
		location: formData.get("location"),
		token: formData.get("token"),
		eventStartDate: formData.get("eventStartDate"),
		eventEndDate: formData.get("eventEndDate"),
		saleStartDate: formData.get("saleStartDate"),
		saleEndDate: formData.get("saleEndDate"),
		shortDescription: formData.get("shortDescription"),
		longDescription: formData.get("longDescription"),
		status: formData.get("status"),
		bank: formData.get("bank"),
		paymentLink: formData.get("paymentLink"),
	});

	if (internalServerError) return { message: "Internal server error. Please try again." };

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	try {
		await prisma.event.update({
			where: {
				id: session.currentEventId,
				status: {
					isNot: {
						value: "DEACTIVATED",
					},
				},
			},
			data: {
				status: {
					connect: {
						value: parse.data.status,
					},
				},
				name: parse.data.title,
				token: parse.data.token.toLowerCase(),
				short_description: parse.data.shortDescription,
				long_description: formData.get("longDescription") ? parse.data.longDescription : null,
				location: parse.data.location,
				start_date: new Date(formData.get("eventStartDateUTC")!.toString()),
				end_date: new Date(formData.get("eventEndDateUTC")!.toString()),
				sale_start_date: formData.get("saleStartDate") ? new Date(formData.get("saleStartDateUTC")!.toString()) : null,
				sale_end_date: formData.get("saleEndDate") ? new Date(formData.get("saleEndDateUTC")!.toString()) : null,
				payment_link: parse.data.paymentLink ?? null,
				bank: parse.data.bank ?? null,
				minor_allowance: formData.get("minorAllowance") === "on",
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Internal server error. Please try again. If the problem persists, contact support." };
	}

	revalidatePath("/admin/events");

	if (parse.data.status === "DISABLED") {
		await lucia.invalidateSession(session.id);
		await lucia.createSession(
			user.id,
			{
				currentEventId: null,
			},
			{
				sessionId: session.id,
			}
		);
		redirect("/admin/events");
	}

	return { message: "success" };
}

export async function editEventImagesAction(prevState: ImageEditError, formData: FormData): Promise<ImageEditError> {
	const { session, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("editSettings")) return { message: "You do not have permission to edit images" };

	const id = formData.get("id")?.toString() ?? undefined;

	if (!id || !["main_image", "first_image", "second_image", "third_image"].includes(id)) return { message: "Invalid i id" };

	const file = (formData.get("file") as File) || undefined;

	let event;
	try {
		event = await prisma.event.findUniqueOrThrow({
			where: {
				id: session.currentEventId,
			},
			select: {
				uuid: true,
				main_image: true,
				first_image: true,
				second_image: true,
				third_image: true,
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "No event found" };
	}

	const image = id === "main_image" ? event.main_image : id === "first_image" ? event.first_image : id === "second_image" ? event.second_image : event.third_image;

	if (file === undefined || file.size === 0) {
		if (image === null) return { message: "No image found" };

		try {
			await prisma.event.update({
				where: {
					id: session.currentEventId,
				},
				data: {
					[id]: null,
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Internal server error." };
		}

		removeEventPicture(image, event.uuid);
		return { message: "success" };
	}

	// if file size is bigger than 3mb
	if (file.size > 3000000) return { message: "File must be less than 3mb" };

	if (!["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) return { message: "File must be a png, jpg, jpeg, webp or gif" };

	const buffer = Buffer.from(await file.arrayBuffer());

	const newPath = path.join(process.cwd(), "public", "uploads", "events", event.uuid);
	const newFileName = id + path.extname(file.name).toLowerCase();

	if (!existsSync(newPath)) {
		mkdirSync(newPath, { recursive: true });
	}

	removeEventPicture(image ?? "", event.uuid);

	try {
		await writeFile(path.join(newPath, newFileName), buffer);
	} catch (e) {
		console.error(e);
		return { message: "Failed to upload image" };
	}

	try {
		await prisma.event.update({
			where: {
				id: session.currentEventId,
			},
			data: {
				[id]: newFileName,
			},
		});
	} catch (e) {
		console.error(e);
		return { message: "Failed to update image" };
	}

	revalidatePath("/");

	return { message: "success", url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/uploads/events/${event.uuid}/${newFileName}` };
}

function removeEventPicture(oldFileName: string, uuid: string) {
	if (oldFileName.trim() === "") return;
	const oldPath = path.join(process.cwd(), "public", "uploads", "events", uuid);
	const newPath = path.join(process.cwd(), "private", "storage", "events", uuid);
	const newFileName = Date.now().toString() + oldFileName;

	if (!existsSync(oldPath)) return;

	if (!existsSync(newPath)) {
		mkdirSync(newPath, { recursive: true });
	}

	copyFileSync(path.join(oldPath, oldFileName), path.join(newPath, newFileName));
	unlinkSync(path.join(newPath, newFileName));
}
