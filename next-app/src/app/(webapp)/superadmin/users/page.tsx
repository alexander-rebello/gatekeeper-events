import prisma from "@/db/client";
import { checkSuperAdmin } from "@/auth/lucia";
import UserTable from "./table";

export default async function Users() {
	const result = await prisma.user.findMany({
		orderBy: {
			created_at: "desc",
		},
		select: {
			uuid: true,
			created_at: true,
			email: true,
			email_verified: true,
			first_name: true,
			last_name: true,
			status: {
				select: {
					value: true,
				},
			},
			_count: {
				select: {
					events: true,
				},
			},
		},
	});

	const data = result.map((user) => ({
		uuid: user.uuid,
		name: user.first_name + " " + user.last_name,
		email: user.email,
		email_verified: user.email_verified !== null,
		status: user.status.value,
		events: user._count.events,
		created_at: user.created_at,
	}));

	return <UserTable data={data} />;
}
