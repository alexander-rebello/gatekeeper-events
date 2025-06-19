import prisma from "@/db/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createFullSession } from "../lucia";

export type LoginActionError =
	| {
			email?: string[] | undefined;
			password?: string[] | undefined;
	  }
	| string
	| undefined;

export type LoginData = {
	email: FormDataEntryValue | null;
	password: FormDataEntryValue | null;
};

export default async function login(data: LoginData): Promise<LoginActionError> {
	const schema = z.object({
		email: z.string().trim().min(1, "Required").email("Invalid email"),
		password: z.string().trim().min(1, "Required"),
	});

	const parse = await schema.safeParseAsync({
		email: data.email,
		password: data.password,
	});

	if (!parse.success) return parse.error.formErrors.fieldErrors;

	let user;
	try {
		user = await prisma.user.findUnique({
			where: {
				email: parse.data.email.toLowerCase(),
			},
			select: {
				id: true,
				uuid: true,
				first_name: true,
				last_name: true,
				email: true,
				email_verified: true,
				password: true,
				status: {
					select: {
						value: true,
					},
				},
			},
		});
	} catch (e) {
		console.error(e);
		return "Internal Server Error. Please try again";
	}

	if (!user || !(await bcrypt.compare(parse.data.password, user.password))) return "Incorrect email or password";

	if (user.status?.value === "DISABLED") {
		try {
			await prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					status: {
						connect: {
							value: "ACTIVE",
						},
					},
				},
			});
		} catch (e) {
			console.error(e);
			return "Internal Server Error. Please try again";
		}
	} else if (user.status?.value !== "ACTIVE") {
		return "Your account has been deactivated. Please contact support.";
	}

	try {
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				last_login: new Date(),
			},
		});
	} catch (e) {
		console.error(e);
	}

	await createFullSession({
		id: user.id,
		uuid: user.uuid,
		firstName: user.first_name,
		lastName: user.last_name,
		email: user.email.toLowerCase(),
		emailVerified: user.email_verified !== null,
	});

	return undefined;
}
