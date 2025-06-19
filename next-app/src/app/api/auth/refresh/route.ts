import prisma from "@/db/client";
import { NextResponse, NextRequest } from "next/server";
import { createAuthTokenAnswer } from "../../utils";

export async function POST(request: NextRequest) {
	const headers = { "Content-Type": "application/json" };
	let body;

	try {
		body = await request.json();
	} catch (error) {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid JSON" }), { status: 400, headers });
	}

	if (body.token === undefined) {
		return new NextResponse(JSON.stringify({ message: "Bad request, missing token" }), { status: 400, headers });
	}

	if (Object.keys(body).length > 1) {
		return new NextResponse(JSON.stringify({ message: "Bad request, too many attributes" }), { status: 400, headers });
	}

	if (typeof body.token !== "string") {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid token" }), { status: 400, headers });
	}

	if (body.token.trim().length === 0) {
		return new NextResponse(JSON.stringify({ message: "Bad request, empty email or password" }), { status: 400, headers });
	}

	if (body.token.includes(" ")) {
		return new NextResponse(JSON.stringify({ message: "Bad request, email or password cannot contain spaces" }), { status: 400, headers });
	}

	if (body.token.length !== 64) {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid token length" }), { status: 400, headers });
	}

	let apiToken;

	try {
		apiToken = await prisma.api_token.findUnique({
			where: {
				refresh_token: body.token,
			},
			select: {
				refresh_token_expires_at: true,
			},
		});
	} catch (error) {
		console.error(error);
		return new NextResponse(JSON.stringify({ message: "Internal server error" }), { status: 500, headers });
	}

	if (!apiToken) {
		return new NextResponse(JSON.stringify({ message: "Unauthorized, invalid token" }), { status: 401, headers });
	}

	if (apiToken.refresh_token_expires_at <= new Date()) {
		return new NextResponse(JSON.stringify({ message: "Unauthorized, token expired" }), { status: 401, headers });
	}

	const tokenData = createAuthTokenAnswer();

	let result;

	try {
		result = await prisma.api_token.update({
			where: {
				refresh_token: body.token,
			},
			data: {
				access_token: tokenData.accessToken,
				access_token_expires_at: tokenData.accessTokenExpiresAt,
				refresh_token: tokenData.refreshToken,
				refresh_token_expires_at: tokenData.refreshTokenExpiresAt,
			},
			select: {
				access_token: true,
				access_token_expires_at: true,
				refresh_token: true,
				refresh_token_expires_at: true,
			},
		});
	} catch (error) {
		console.error(error);
		return new NextResponse(JSON.stringify({ message: "Internal server error" }), { status: 500, headers });
	}

	const token = {
		accessToken: result.access_token,
		accessTokenExpiresAt: result.access_token_expires_at,
		refreshToken: result.refresh_token,
		refreshTokenExpiresAt: result.refresh_token_expires_at,
	};

	return new NextResponse(JSON.stringify(token), { status: 200, headers });
}
