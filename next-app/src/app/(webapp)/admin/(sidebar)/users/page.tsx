import prisma from "@/db/client";
import { validateRequest } from "@/auth/lucia";
import UsersTable, { User } from "./table";
import { redirect } from "next/navigation";

export default async function Users() {
	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("viewUsers")) redirect("/admin/overview");

	const result = await prisma.event.findUniqueOrThrow({
		where: {
			id: session.currentEventId,
		},
		select: {
			created_at: true,
			owner: {
				select: {
					id: true,
					email: true,
					first_name: true,
					last_name: true,
					image: true,
				},
			},
			user_event_roles: {
				select: {
					date_added: true,
					event_role: {
						select: {
							name: true,
						},
					},
					user: {
						select: {
							id: true,
							email: true,
							first_name: true,
							last_name: true,
							image: true,
						},
					},
				},
			},
		},
	});

	const roles = await prisma.event_role.findMany({
		select: {
			name: true,
			event_role_permissions: {
				select: {
					permission_id: true,
				},
			},
		},
	});

	const possiblePerms = await prisma.event_permission.findMany({
		select: {
			name: true,
			description: true,
		},
	});

	const data: User[] = [
		{
			id: result.owner.id,
			email: result.owner.email,
			first_name: result.owner.first_name,
			last_name: result.owner.last_name,
			image: result.owner.image,
			role: "Owner",
			date_added: result.created_at,
		},
		...result.user_event_roles.map((user) => ({
			...user.user,
			role: user.event_role.name,
			date_added: user.date_added,
		})),
	];

	return (
		<>
			<UsersTable data={data} canEdit={permissions.includes("editUserRoles")} />
		</>
	);
}
