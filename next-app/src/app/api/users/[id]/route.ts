import { eAnswer, iAnswer, isValidUUID, sAnswer, validateAccessToken } from "@/app/api/utils";
import prisma from "@/db/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const userId = await validateAccessToken(request);

	if (typeof userId !== "number") return userId;

	if (params.id !== "me") {
		if (!isValidUUID(params.id)) {
			return eAnswer("Bad Request, invalid id", 400);
		}

		if (params.id !== userId.toString()) {
			return eAnswer("Permission denied", 403);
		}
	}

	let user;
	try {
		user = await prisma.user.findUnique({
			where: {
				id: userId,
				status: {
					is: {
						value: "ACTIVE",
					},
				},
			},
			select: {
				uuid: true,
				first_name: true,
				last_name: true,
				email: true,
				email_verified: true,
				events: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return iAnswer();
	}

	if (user === null) {
		return eAnswer("Forbidden, User diabled or deactivated", 403);
	}

	return sAnswer(user);
}
