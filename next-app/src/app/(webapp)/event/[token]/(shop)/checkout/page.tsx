import prisma from "@/db/client";
import { notFound } from "next/navigation";
import PageContent from "./content";
import { Metadata } from "next";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Checkout",
	};
}

export default async function Page(props: Props) {
	const params = await props.params;
	const token = params.token;

	if (token.length < 4 || token.length > 32 || !/^[a-zA-Z0-9]+$/.test(token)) notFound();

	let event;

	try {
		event = await prisma.event.findUnique({
			where: {
				token: token.toLowerCase(),
				status: {
					value: "PUBLIC",
				},
			},
			select: {
				uuid: true,
				tickets: {
					where: {
						status: {
							value: "ACTIVE",
						},
					},
					select: {
						price: true,
						id: true,
						title: true,
						color: true,
						max_quantity: true,
						description: true,
						_count: {
							select: {
								tickets: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (event === null) notFound();

	const tickets = event.tickets.map((ticket) => ({
		title: ticket.title,
		description: ticket.description,
		color: ticket.color,
		id: ticket.id,
		price: ticket.price.toNumber(),
		available: ticket.max_quantity > 0 ? Math.max(ticket.max_quantity - ticket._count.tickets, 0) : -1,
	}));

	return <PageContent uuid={event.uuid} tickets={tickets} token={token} />;
}
