import prisma from "@/db/client";
import EditUsersModal, { User } from "./modal";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";

async function getUserData(eventId: number, id: number): Promise<User> {
	const allPerms = await prisma.event_permission.findMany({
		select: {
			id: true,
			name: true,
			description: true,
		},
		orderBy: {
			id: "asc",
		},
	});

	const ownerId = await prisma.event.findUnique({
		where: { id: eventId },
		select: {
			owner: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
				},
			},
		},
	});
	if (!ownerId) redirect("/admin/events");

	if (ownerId.owner.id === id) {
		return {
			id: ownerId.owner.id,
			firstName: ownerId.owner.first_name,
			lastName: ownerId.owner.last_name,
			roleId: -1,
			allRoles: [
				{
					id: -1,
					name: "Event Owner",
					permissions: allPerms.map((perm) => perm.id),
				},
			],
			allPermissions: allPerms,
		};
	}

	const allRoles = await prisma.event_role.findMany({
		select: {
			id: true,
			name: true,
			event_role_permissions: {
				select: {
					permission_id: true,
				},
			},
		},
	});

	const dataResult = await prisma.user_event_roles.findUnique({
		where: {
			user_id_event_id: {
				user_id: id,
				event_id: eventId,
			},
		},
		select: {
			user: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
				},
			},
			event_role: {
				select: {
					id: true,
					event_role_permissions: {
						select: {
							event_permission: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!dataResult) redirect("/admin/users");

	return {
		id: dataResult.user.id,
		firstName: dataResult.user.first_name,
		lastName: dataResult.user.last_name,
		roleId: dataResult.event_role.id,
		allPermissions: allPerms,
		allRoles: allRoles.map((role) => ({
			id: role.id,
			name: role.name,
			permissions: role.event_role_permissions.map((perm) => perm.permission_id),
		})),
	};
}

export default async function Modal({ params }: { params: Promise<{ id: string }> }) {
	const args = await params;

	const id = parseInt(args.id);

	if (isNaN(id) || id + "" !== args.id) redirect("/admin/discounts");

	const { session, permissions } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	if (!permissions.includes("editUserRoles")) redirect("/admin/users");

	const data = await getUserData(session.currentEventId, id);

	return <EditUsersModal data={data} />;
}
