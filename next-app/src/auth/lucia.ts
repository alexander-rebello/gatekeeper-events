import { Lucia, Session, TimeSpan, User } from "lucia";

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";

import prisma from "@/db/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
		UserId: number;
	}
}

interface DatabaseSessionAttributes {
	currentEventId: number | null;
}
interface DatabaseUserAttributes {
	uuid: string;
	first_name: string;
	last_name: string;
	email: string;
	email_verified: Date;
}

export enum AllowedPrivaleges {
	USER = "USER",
	GUEST = "GUEST",
}

export type UserWithSession = {
	user: User;
	session: Session;
	permissions: string[];
};

export type MaybeUserWithSession =
	| UserWithSession
	| {
			user: null;
			session: null;
			permissions: string[];
	  };

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(15, "d"),
	sessionCookie: {
		name: "session",
		expires: true,
		attributes: {
			// set to `true` when using HTTPS
			secure: process.env.NODE_ENV === "production",
		},
	},
	getUserAttributes: (attributes) => {
		return {
			uuid: attributes.uuid,
			email: attributes.email.toLowerCase(),
			firstName: attributes.first_name,
			lastName: attributes.last_name,
			emailVerified: attributes.email_verified !== null,
		};
	},
	getSessionAttributes: (attributes) => {
		return {
			currentEventId: attributes.currentEventId,
		};
	},
});

export const validateRequest = async (page: boolean = false): Promise<MaybeUserWithSession> => {
	const cookie = await cookies();
	const sessionId = cookie.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		return {
			user: null,
			session: null,
			permissions: [],
		};
	}

	const result = await lucia.validateSession(sessionId);

	if (!page) {
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookie.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookie.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch (error) {
			console.error(error);
		}
	}

	if (result.user === null || result.session.currentEventId === null)
		return {
			...result,
			permissions: [],
		};

	const ownerResult = await prisma.event.findUnique({
		where: {
			id: result.session.currentEventId,
			owner_id: result.user.id,
		},
		select: {
			owner_id: true,
		},
	});

	if (ownerResult !== null) {
		const perms = await prisma.event_permission.findMany({
			select: {
				name: true,
			},
		});

		return {
			...result,
			permissions: perms.map((perm) => perm.name),
		};
	}

	const permsResult = await prisma.user_event_roles.findUnique({
		where: {
			user_id_event_id: {
				user_id: result.user.id,
				event_id: result.session.currentEventId,
			},
		},
		select: {
			event_role: {
				select: {
					event_role_permissions: {
						select: {
							event_permission: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			},
		},
	});

	// User no longer has permissions for the event
	if (permsResult === null) {
		prisma.session.update({
			where: {
				id: result.session.id,
			},
			data: {
				currentEventId: null,
			},
		});

		return {
			session: {
				...result.session,
				currentEventId: null,
			},
			user: result.user,
			permissions: [],
		};
	}

	const permissions = permsResult?.event_role.event_role_permissions.map((perm) => perm.event_permission.name) ?? [];

	return {
		...result,
		permissions,
	};
};

export const checkPrivaleges = async (allowed: AllowedPrivaleges, page: boolean = false, checkEmailVerified: boolean = true): Promise<MaybeUserWithSession> => {
	const { user, session, permissions } = await validateRequest(page);

	if (user) {
		if (checkEmailVerified) {
			if (!user.emailVerified) redirect("/email-verification");
		} else {
			if (user.emailVerified) redirect("/admin/overview");
		}
	}

	if (allowed == AllowedPrivaleges.GUEST) {
		if (user) redirect("/admin/overview");
	} else if (allowed == AllowedPrivaleges.USER) {
		if (user) return { user, session, permissions };
		else redirect("/login");
	}

	return {
		user: null,
		session: null,
		permissions: [],
	};
};

export const checkSuperAdmin = async (page: boolean = false): Promise<UserWithSession> => {
	const { user, session } = await validateRequest(page);

	if (!user) redirect("/login");

	if (!user.emailVerified) redirect("/email-verification");

	const result = await prisma.user.findUnique({
		where: {
			id: user.id,
			role: {
				value: "ADMIN",
			},
		},
		select: {
			id: true,
		},
	});

	if (result === null) redirect("/admin/overview");

	const permissions = await prisma.event_permission.findMany({
		select: {
			name: true,
		},
	});

	return {
		user: user,
		session: session,
		permissions: permissions.map((perm) => perm.name),
	};
};

export const createFullSession = async (user: User): Promise<Session> => {
	const session = await lucia.createSession(user.id, {
		currentEventId: null,
	});
	const sessionCookie = lucia.createSessionCookie(session.id);
	(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return session;
};
