import prisma from "@/db/client";
import { notFound, redirect } from "next/navigation";
import PageContent from "./content";
import { Metadata } from "next";
import { title } from "process";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Tickets",
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
				name: true,
				third_image: true,
				sale_start_date: true,
				sale_end_date: true,
				owner: {
					select: {
						first_name: true,
						last_name: true,
						email: true,
						image: true,
					},
				},
				tickets: {
					where: {
						status: {
							value: "ACTIVE",
						},
					},
					select: {
						id: true,
						title: true,
						price: true,
						max_quantity: true,
						description: true,
						color: true,
						_count: {
							select: {
								tickets: true,
							},
						},
					},
					orderBy: {
						position: "asc",
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (event === null) notFound();

	const now = new Date();

	if ((event.sale_start_date != null && now < event.sale_start_date) || (event.sale_end_date != null && now > event.sale_end_date) || event.tickets.length === 0) redirect("/event/" + token);

	const tickets = event.tickets.map((ticket) => ({
		title: ticket.title,
		description: ticket.description,
		color: ticket.color,
		id: ticket.id,
		price: ticket.price.toNumber(),
		available: ticket.max_quantity > 0 ? Math.max(ticket.max_quantity - ticket._count.tickets, 0) : -1,
	}));

	return <PageContent tickets={tickets} image={event.third_image} uuid={event.uuid} token={token} />;
}
