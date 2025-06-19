"use server";

import { redirect } from "next/navigation";
import { lucia, validateRequest } from "../lucia";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export default async function logoutAction() {
	const { session } = await validateRequest();
	if (session) {
		await lucia.invalidateSession(session.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	revalidatePath("/");
	redirect("/login");
}
