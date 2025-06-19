import Footer from "@/components/navigation/home/footer";
import prisma from "@/db/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata, ResolvingMetadata } from "next";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const params = await props.params;
	const token = await params.token;

	let event;
	try {
		event = await prisma.event.findUniqueOrThrow({
			where: {
				token: token.toLowerCase(),
			},
			select: {
				name: true,
				id: true,
				short_description: true,
				organizer: true,
				owner: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
				main_image: true,
				uuid: true,
			},
		});
	} catch (error) {
		console.error(error);
		return {
			title: {
				absolute: "This event does not exist",
			},
			description: "This event does not exist",
			openGraph: {
				title: "This event does not exist",
				description: "This event does not exist",
			},
			twitter: {
				card: "summary",
				title: "This event does not exist",
				description: "This event does not exist",
			},
		};
	}

	return {
		title: {
			default: event.name,
			template: `%s | ${event.name}`,
		},
		description: event.short_description,
		authors: [{ name: `${event.organizer} (${event.owner.first_name} ${event.owner.last_name})` }],
		openGraph: {
			title: event.name,
			description: event.short_description,
			images: {
				url: event.main_image ? process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/events/" + event.uuid + "/" + event.main_image : "/img/shop.webp",
			},
		},
		twitter: {
			card: "summary",
			title: event.name,
			description: event.short_description,
			creator: `${event.organizer} (${event.owner.first_name} ${event.owner.last_name})`,
			images: [event.main_image ? process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/events/" + event.uuid + "/" + event.main_image : "/img/shop.webp"],
		},
	};
}

export default async function Layout(props: { children: React.ReactNode } & Props) {
	const params = await props.params;

	const { children } = props;

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
				organizer: true,
				owner: {
					select: {
						first_name: true,
						last_name: true,
						email: true,
						image: true,
					},
				},
			},
		});
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code !== "P2025") console.error(error);
		console.error(error);
		notFound();
	}

	if (!event) notFound();

	const organizer = `${event.organizer} (${event.owner.first_name} ${event.owner.last_name})`;
	return (
		<div data-bs-theme='light' className='d-flex flex-column min-vh-100 bg-body'>
			<main className='overflow-hidden d-flex flex-column flex-grow-1'>
				{children}
				<div className='row mt-5'>
					<div className='col-12'>
						<p className='text-center text-muted'>
							Du brauchst Hilfe? Schreibe dem Veranstallter eine E-Mail an <a href={"mailto:" + event.owner.email}>{event.owner.email}</a>
						</p>
						<div className='d-flex justify-content-center align-items-center w-100 pb-5 text-center'>
							{event.owner.image && <Image src={"/public/users/" + event.owner.image} alt={organizer} width={50} height={50} className='rounded-circle me-3 shadow-lg' />}
							<p className='mb-0 text-muted text-center'>{organizer}</p>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
