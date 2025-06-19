import { isValidUUID } from "@/app/api/utils";
import prisma from "@/db/client";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import PageContent from "./content";

type Props = {
	params: Promise<{
		orderUUID: string;
		token: string;
	}>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Successfull Order",
	};
}

export default async function Page(props: Props) {
	const params = await props.params;
	if (!isValidUUID(params.orderUUID)) notFound();

	let order;
	try {
		order = await prisma.order.findUnique({
			where: {
				uuid: params.orderUUID,
			},
			select: {
				uuid: true,
				status: {
					select: {
						value: true,
					},
				},
				event: {
					select: {
						uuid: true,
						bank: true,
						payment_link: true,
						minor_allowance: true,
						token: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (!order) notFound();

	if (order.event.token !== params.token) redirect(`/event/${order.event.token}/success/${order.uuid}`);

	return <PageContent order={order} />;
}
