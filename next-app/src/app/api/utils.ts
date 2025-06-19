import prisma from "@/db/client";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const JSON_HEADERS = { "Content-Type": "application/json" };

export type AuthTokenAnswer = {
	accessToken: string;
	accessTokenExpiresAt: Date;
	refreshToken: string;
	refreshTokenExpiresAt: Date;
};

export function createAuthTokenAnswer(): AuthTokenAnswer {
	return {
		accessToken: randomBytes(16).toString("hex"), // 32 characters (128 bits)
		accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
		refreshToken: randomBytes(32).toString("hex"), // 64 characters (256 bits)
		refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
	};
}

export async function validateAccessToken(request: NextRequest): Promise<number | NextResponse> {
	const token = request.headers.get("Authorization");
	if (token === null) {
		return eAnswer("Bad request, missing token", 400);
	}

	if (token.trim().length === 0) {
		return eAnswer("Bad request, empty token", 400);
	}

	if (token.includes(" ")) {
		return eAnswer("Bad request, token cannot contain spaces", 400);
	}

	let apiToken;
	try {
		apiToken = await prisma.api_token.findUnique({
			where: {
				access_token: token,
			},
			select: {
				access_token_expires_at: true,
				user: {
					select: {
						id: true,
						status: {
							select: {
								value: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		return eAnswer("Internal server error", 500);
	}

	if (apiToken === null) {
		return eAnswer("Unauthorized, invalid token", 401);
	}

	if (apiToken.access_token_expires_at <= new Date()) {
		return eAnswer("Unauthorized, expired token", 401);
	}

	if (apiToken.user.status.value === "DISABLED" || apiToken.user.status.value === "DEACTIVATED") {
		return eAnswer("Forbidden, User diabled or deactivated", 403);
	}

	return apiToken.user.id;
}

export function isValidUUID(uuid: string): boolean {
	const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return regexExp.test(uuid);
}

export async function checkEventId(pId: any, currentUserId: number): Promise<number | NextResponse> {
	const id = parseInt(pId);

	if (isNaN(id)) {
		return eAnswer("Bad Request, invalid id", 400);
	}

	if (id < 0) {
		return eAnswer("Bad Request, id cannot be negative", 400);
	}

	const eventCheck = await prisma.event.findUnique({
		where: {
			id: id,
		},
		select: {
			owner_id: true,
			status: {
				select: {
					value: true,
				},
			},
		},
	});

	if (eventCheck === null) {
		return eAnswer("Event not Found", 404);
	}

	if (eventCheck.owner_id !== currentUserId) {
		return eAnswer("Permission denied", 403);
	}

	if (eventCheck.status.value !== "PUBLIC" && eventCheck.status.value !== "HIDDEN") {
		return eAnswer("Forbidden, Event disabled or deactivated", 403);
	}

	return id;
}

export function eAnswer(message: string, code: number): NextResponse {
	return new NextResponse(JSON.stringify({ error: message }), { status: code, headers: JSON_HEADERS });
}

export function iAnswer(): NextResponse {
	return eAnswer("Internal server error", 500);
}

export function sAnswer(data: any): NextResponse {
	return new NextResponse(JSON.stringify(data), { status: 200, headers: JSON_HEADERS });
}
