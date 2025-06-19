import prisma from "@/db/client";
import path from "path";
import { sendEmail } from "./email";

export enum TokenType {
	EMAIL = "EMAIL",
	PASSWORD = "PASSWORD",
}

export const generateToken = () => {
	// Generate a random string
	const randomString = Math.random().toString(36).substring(2, 12);

	// Generate a unique identifier
	const uniqueId = Date.now().toString(36);

	// Combine the random string and unique identifier
	const token = randomString + uniqueId;

	return token;
};

export const generateVerificationToken = async (userId: number, type: TokenType): Promise<string | false> => {
	try {
		const storedToken = await prisma.token.findFirst({
			where: {
				user_id: userId,
				type: {
					value: type,
				},
			},
			select: {
				id: true,
				token: true,
				expires: true,
			},
		});

		if (storedToken) {
			if (new Date() < storedToken.expires) return storedToken.token;

			await prisma.token.delete({
				where: {
					id: storedToken.id,
				},
			});
		}

		const token = generateToken();

		await prisma.token.create({
			data: {
				token,
				user: {
					connect: {
						id: userId,
					},
				},
				type: {
					connect: {
						value: type,
					},
				},
			},
		});

		return token;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const purgeExpiredTokens = async () => {
	try {
		const deletedTokens = await prisma.token.deleteMany({
			where: {
				expires: {
					lte: new Date(),
				},
			},
		});
		console.info(`Purged ${deletedTokens.count} expired tokens`);
	} catch (error) {
		console.error(error);
	}
};

export const sendVerificationEmail = async (email: string, token: string, name: string, type: TokenType): Promise<true | string> => {
	const result = await sendEmail({
		name: name,
		email: email,
		subject: type === TokenType.EMAIL ? "Email Verification" : "Password Reset",
		textContent: "Please click the button below to verify your email.",
		html: {
			file: path.join(process.cwd(), "private", "email", "verification-email.html"),
			replaceAll: true,
			replacements: {
				NAME: name,
				TOKEN: token,
				TEXT: type === TokenType.EMAIL ? "Please click the button below to verify your email." : "Please click the button below to reset your password.",
				BUTTON: type === TokenType.EMAIL ? "Verify Email" : "Reset Password",
				URL: process.env.NEXT_PUBLIC_PUBLIC_URL + (type === TokenType.EMAIL ? "/email-verification/" : "/reset-password/") + token,
			} as Record<string, string>,
		},
	});

	return result;
};
