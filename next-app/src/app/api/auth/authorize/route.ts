import prisma from "@/db/client";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAuthTokenAnswer } from "../../utils";

export async function POST(request: NextRequest) {
	const headers = { "Content-Type": "application/json" };
	let body;

	try {
		body = await request.json();
	} catch (error) {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid JSON" }), { status: 400, headers });
	}

	if (body.email === undefined || body.password === undefined) {
		return new NextResponse(JSON.stringify({ message: "Bad request, missing email or password" }), { status: 400, headers });
	}

	if (Object.keys(body).length > 2) {
		return new NextResponse(JSON.stringify({ message: "Bad request, too many attributes" }), { status: 400, headers });
	}

	if (typeof body.email !== "string" || typeof body.password !== "string") {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid email or password" }), { status: 400, headers });
	}

	if (body.email.trim().length === 0 || body.password.trim().length === 0) {
		return new NextResponse(JSON.stringify({ message: "Bad request, empty email or password" }), { status: 400, headers });
	}

	if (body.email.includes(" ") || body.password.includes(" ")) {
		return new NextResponse(JSON.stringify({ message: "Bad request, email or password cannot contain spaces" }), { status: 400, headers });
	}

	if (body.email.length > 32 || body.password.length > 64) {
		return new NextResponse(JSON.stringify({ message: "Bad request, email or password too long" }), { status: 400, headers });
	}

	if (z.string().email().safeParse(body.email).success === false) {
		return new NextResponse(JSON.stringify({ message: "Bad request, invalid email" }), { status: 400, headers });
	}

	let user;

	try {
		user = await prisma.user.findUnique({
			where: {
				email: (body.email as string).toLowerCase(),
			},
			select: {
				email: true,
				email_verified: true,
				password: true,
			},
		});
	} catch (error) {
		console.error(error);
		return new NextResponse(JSON.stringify({ message: "Internal server error" }), { status: 500, headers });
	}

	if (!user || !(await bcrypt.compare(body.password, user.password))) {
		return new NextResponse(JSON.stringify({ message: "Unauthorized, email or password incorrect" }), { status: 401, headers });
	}

	if (user.email_verified === null) {
		return new NextResponse(JSON.stringify({ message: "Unauthorized, email not verified" }), { status: 401, headers });
	}

	const tokenData = createAuthTokenAnswer();

	let result;

	try {
		result = await prisma.api_token.create({
			data: {
				user: {
					connect: {
						email: user.email.toLowerCase(),
					},
				},
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
