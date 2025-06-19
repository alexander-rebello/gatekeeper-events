import prisma from "@/db/client";
import { notFound } from "next/navigation";
import PageContent from "./content";
import { Metadata } from "next";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Details",
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
						id: true,
						title: true,
						color: true,
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (event === null) notFound();

	return <PageContent uuid={event.uuid} token={token} tickets={event.tickets} />;
}
