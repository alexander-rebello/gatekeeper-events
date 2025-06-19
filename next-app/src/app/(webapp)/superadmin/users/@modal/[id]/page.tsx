import prisma from "@/db/client";
import EditDiscountCodeModal, { User } from "./modal";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth/lucia";
import { isValidUUID } from "@/app/api/utils";
import EditUserModal from "./modal";

async function getUserData(uuid: string): Promise<User> {
	const dataResult = await prisma.user.findUnique({
		where: {
			uuid: uuid,
		},
		select: {
			uuid: true,
			email: true,
			email_verified: true,
			first_name: true,
			last_name: true,
			status: {
				select: {
					value: true,
				},
			},
			created_at: true,
			events: {
				select: {
					uuid: true,
					name: true,
				},
			},
			image: true,
		},
	});

	if (!dataResult) redirect("/superadmin/users");

	return {
		...dataResult,
		status: dataResult.status.value,
	};
}

export default async function Modal(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	if (!isValidUUID(params.id)) redirect("/superadmin/users");

	const data = params.id === "new" ? null : await getUserData(params.id);

	return <EditUserModal data={data} />;
}
