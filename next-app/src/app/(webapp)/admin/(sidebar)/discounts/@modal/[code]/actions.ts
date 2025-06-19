"use server";
import { validateRequest } from "@/auth/lucia";
import { isAlphaNumeric } from "@/components/utils";
import prisma from "@/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodIssueCode, z } from "zod";

export type EditDiscountCodeServerResult = {
	message?:
		| {
				value?: string[] | undefined;
				code?: string[] | undefined;
				isPercentage?: string[] | undefined;
				status?: string[] | undefined;
		  }
		| string;
};

export default async function editDiscountCodeAction(prevState: EditDiscountCodeServerResult, formData: FormData): Promise<EditDiscountCodeServerResult> {
	const { session, permissions } = await validateRequest();

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (formData.get("action") === "delete" && formData.get("new") === "new") return { message: "Invalid dc code" };

	if (formData.get("action") === "delete") {
		if (!permissions.includes("deleteDiscountCodes")) return { message: "You do not have permission to delete discount codes" };

		try {
			const check = await prisma.order.findFirst({
				where: {
					discount_code: {
						code: formData.get("code") as string,
						event_id: session.currentEventId,
					},
				},
			});

			if (check) return { message: "Discount Code is part of an order and cannot be deleted" };

			await prisma.discount_code.delete({
				where: {
					code_event_id: {
						code: formData.get("code") as string,
						event_id: session.currentEventId,
					},
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Could not delete discount code" };
		}
		revalidatePath("/admin/discounts");
		return { message: "success" };
	}

	if (formData.get("new") === "new" && !permissions.includes("createDiscountCodes")) return { message: "You do not have permission to create discount codes" };
	if (formData.get("new") !== "new" && !permissions.includes("editDiscountCodes")) return { message: "You do not have permission to edit discount codes" };

	const codeExists = await prisma.discount_code.findUnique({
		where: {
			code_event_id: {
				code: formData.get("code") as string,
				event_id: session.currentEventId,
			},
		},
		select: {
			id: true,
		},
	});

	if (formData.get("new") !== "new" && !codeExists) return { message: "Discount code does not exist" };

	const isPercentage = formData.get("discountType") === "percentage";
	const status = formData.get("status") === "on" ? "ACTIVE" : "DISABLED";

	const schema = z
		.object({
			code: z
				.string()
				.trim()
				.min(1, "Required")
				.max(32, "Maximum of 32 characters")
				.refine((code) => isAlphaNumeric(code), "Code must be alphanumeric"),
			value: isPercentage ? z.coerce.number().positive("Invalid percentage").max(100, "Invalid percentage") : z.coerce.number().positive("Invalid Value"),
		})
		.superRefine(async (d, ctx) => {
			if (formData.get("code") == "new") {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: "Code cannot be 'new'",
				});
			}
			if (formData.get("new") !== "new") return;

			if (codeExists)
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: "Code already exists",
					path: ["code"],
				});
		});

	const parse = await schema.safeParseAsync({
		code: formData.get("code"),
		value: formData.get("value"),
	});

	if (!parse.success) return { message: parse.error.formErrors.fieldErrors };

	if (formData.get("new") === "new") {
		try {
			await prisma.discount_code.create({
				data: {
					event: {
						connect: {
							id: session.currentEventId,
						},
					},
					status: {
						connect: {
							value: status,
						},
					},
					code: parse.data.code,
					value: Math.floor((isPercentage ? parse.data.value / 100 : parse.data.value) * 100) / 100,
					is_percentage: isPercentage,
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to create discount code" };
		}
	} else {
		try {
			await prisma.discount_code.update({
				where: {
					code_event_id: {
						code: formData.get("code") as string,
						event_id: session.currentEventId,
					},
					status: {
						NOT: {
							value: "DEACTIVATED",
						},
					},
				},
				data: {
					code: parse.data.code,
					value: isPercentage ? parse.data.value / 100 : parse.data.value,
					is_percentage: isPercentage,
					status: {
						connect: {
							value: status,
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return { message: "Failed to update discount code" };
		}
	}
	revalidatePath("/admin/discounts");
	return { message: "success" };
}
