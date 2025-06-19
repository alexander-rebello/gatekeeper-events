import Image from "next/image";
import prisma from "@/db/client";
import { notFound } from "next/navigation";
import { formatDate, utcToLocaleDate } from "@/components/utils";
import Link from "next/link";
import BaseTile from "@/components/tiles/base-tile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faDownload } from "@fortawesome/free-solid-svg-icons";

import { Metadata } from "next";
import ClientTime from "@/components/ClientTime";

type Props = {
	params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
	return {
		title: "Info",
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
				id: true,
				location: true,
				name: true,
				start_date: true,
				end_date: true,
				sale_start_date: true,
				sale_end_date: true,
				main_image: true,
				first_image: true,
				second_image: true,
				short_description: true,
				long_description: true,
				minor_allowance: true,
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
					},
				},
				uuid: true,
			},
		});
	} catch (error) {
		console.error(error);
		notFound();
	}

	if (event === null) notFound();

	event.start_date = utcToLocaleDate(event.start_date);
	event.end_date = utcToLocaleDate(event.end_date);
	if (event.sale_start_date) event.sale_start_date = utcToLocaleDate(event.sale_start_date);
	if (event.sale_end_date) event.sale_end_date = utcToLocaleDate(event.sale_end_date);
	const now = new Date();

	// Determine ticket shop status
	const hasTickets = event.tickets.length > 0;
	const isOpen = (event.sale_start_date == null || now >= event.sale_start_date) && (event.sale_end_date == null || now <= event.sale_end_date) && hasTickets;
	const isComingSoon = event.sale_start_date != null && now < event.sale_start_date;

	const bgUrl = event.main_image ? process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/events/" + event.uuid + "/" + event.main_image : "/img/shop.webp";

	return (
		<>
			<section id='shop-hero' className='d-flex flex-column' style={{ background: `url('${bgUrl}') center / cover; text-shadow: #000 3px 3px; height: 80vh` }}>
				<div className='flex-grow-1'>
					<div className='container h-100'>
						<div className='row h-100'>
							<div className='col-12 text-white d-flex flex-column justify-content-center'>
								<h1 className='text-uppercase fw-bold mb-3'>{event.name}</h1>
								<p className='mb-4 fs-4'>{event.short_description}</p>
							</div>
						</div>
					</div>
				</div>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 155'>
					<path
						fill='rgb(var(--bs-body-bg-rgb))'
						d='M0,0L48,21.30000000000001C96,43,192,85,288,101.30000000000001C384,117,480,107,576,90.69999999999999C672,75,768,53,864,37.30000000000001C960,21,1056,11,1152,26.69999999999999C1248,43,1344,85,1392,106.69999999999999L1440,128L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z'
					></path>
				</svg>
			</section>
			<section className='pt-5'>
				<div className='container-xl'>
					<div className='row gy-4'>
						<div className='col-12 col-lg-8 d-flex flex-column'>
							<BaseTile className='mb-4 flex-grow-1'>
								<p className='text-justify mb-0 text-multiline'>{event.long_description ?? event.short_description}</p>
							</BaseTile>
							{event.first_image && <Image src={event.first_image} alt='Sponsor 1' width={1000} height={300} className='img-fluid rounded-3 shadow-lg' />}
						</div>
						<div className='col-12 col-lg-4 d-flex flex-column'>
							<BaseTile className='mb-4' title='Informationen'>
								<div className='table-responsive bg-transparent mb-0 rounded-bottom-3 text-body'>
									<table className='table table-striped table-borderless border-0 fenix'>
										<tbody>
											<tr>
												<td>Beginn</td>
												<td>
													<ClientTime date={event.start_date} />
												</td>
											</tr>
											<tr>
												<td>Ende</td>
												<td>
													<ClientTime date={event.end_date} />
												</td>
											</tr>
											<tr>
												<td>Ort</td>
												<td>{event.location}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</BaseTile>
							<BaseTile title='Tickets' className='mb-4'>
								<div className='flex-grow-1 d-flex flex-column justify-content-around'>
									<Link className={"btn btn-primary w-100 mt-2" + (isOpen ? "" : " disabled")} href={isOpen ? `/event/${token}/tickets` : "#"}>
										{isComingSoon || !hasTickets ? "Bald verfügbar" : isOpen ? "Zum Ticketshop" : "Geschlossen"}
										<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
									</Link>

									<p className={`mt-3 fenix text-muted text-center ${event.minor_allowance ? "" : "mb-0"}`}>
										{isComingSoon && hasTickets ? (
											<>
												Der Shop ist ab dem <ClientTime date={event.sale_start_date!} /> verfügbar
											</>
										) : !hasTickets ? (
											"Der Shop ist bald verfügbar"
										) : isOpen ? (
											<>
												Der Shop schließt am <ClientTime date={event.sale_end_date ?? event.start_date} />
											</>
										) : (
											"Der Verkaufsschluss wurde erreicht."
										)}
									</p>

									{event.minor_allowance && (
										<p className='mb-0 text-center'>
											Bei dieser Veranstaltung benötigen Minderjährige einen
											<Link download={true} href={"/muttizettel.pdf"} className='text-decoration-none ms-3'>
												<FontAwesomeIcon icon={faDownload} className='me-1' />
												Muttizettel
											</Link>
										</p>
									)}
								</div>
							</BaseTile>
							{event.second_image && <Image src={event.second_image} alt='Sponsor 2' width={500} height={300} className='img-fluid rounded-3 shadow-lg' />}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
