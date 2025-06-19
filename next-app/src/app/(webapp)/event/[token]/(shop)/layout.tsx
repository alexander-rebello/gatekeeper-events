import prisma from "@/db/client";
import { notFound, redirect } from "next/navigation";

export default async function Layout(props: { children: React.ReactNode; params: Promise<{ token: string }> }) {
	const params = await props.params;

	const { children } = props;

	let event;
	try {
		event = await prisma.event.findUnique({
			where: {
				token: params.token,
			},
			select: {
				name: true,
				sale_start_date: true,
				sale_end_date: true,
				start_date: true,
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (!event) notFound();

	const now = new Date();
	if ((event.sale_start_date && now < event.sale_start_date) || (event.sale_end_date && now > event.sale_end_date) || now > event.start_date) redirect("/event/" + params.token);

	return (
		<section className='bg-body pt-5'>
			<div className='container-xl mt-5'>
				<h1 className='text-dark mb-5 ps-3'>{event.name}</h1>
				{children}
			</div>
		</section>
	);
}
