"use client";
import { useFormStatus } from "react-dom";
import chooseEventAction from "./actions";
import { faBan, faExclamationTriangle, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { formatDate } from "@/components/utils";
import { Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import { useActionState } from "react";
import ClientTime from "@/components/ClientTime";

export type Event = {
	id: number;
	owner:
		| true
		| {
				firstName: string;
				lastName: string;
		  };
	uuid: string;
	name: string;
	mainImage: string | null;
	shortDescription: string;
	startDate: Date;
	location: string;
	status: string;
};

enum EventStatus {
	PUBLIC = "PUBLIC",
	HIDDEN = "HIDDEN",
	DISABLED = "DISABLED",
	DEACTIVATED = "DEACTIVATED",
}

export default function ChooseEventForm({ events, currentEventId }: { events: Event[]; currentEventId: number | null }) {
	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(chooseEventAction, "");

	return (
		<Swiper
			className='p-4'
			slidesPerView={1}
			spaceBetween={30}
			centerInsufficientSlides
			grabCursor
			pagination={{
				clickable: true,
			}}
			scrollbar={{ draggable: true, el: ".swiper-scrollbar", hide: false }}
			modules={[Scrollbar]}
			breakpoints={{
				// when window width is >= 768px
				768: {
					slidesPerView: 2,
				},
				// when window width is >= 992px
				992: {
					slidesPerView: 3,
				},
				// when window width is >= 1400px
				1400: {
					slidesPerView: 4,
				},
			}}
		>
			{events.map((event) => (
				<SwiperSlide key={event.uuid} className='h-auto shadow d-flex justify-content-center' style={{ maxWidth: "400px", minHeight: "550px" }}>
					<div className={"card w-100 h-100 border-" + (event.status === EventStatus.DEACTIVATED ? "danger" : currentEventId === event.id ? "success" : event.status === EventStatus.DISABLED ? "warning" : "default")}>
						<div className='card-body d-flex flex-column'>
							<div className='mb-3 d-block position-relative overflow-hidden rounded' style={{ height: "200px" }}>
								<Image src={event.mainImage ? process.env.NEXT_PUBLIC_PUBLIC_URL + "/uploads/events/" + event.uuid + "/" + event.mainImage : "/img/placeholder.webp"} alt='Event Preview Main Image' fill />
							</div>
							<div className='px-2'>
								<div className='d-flex justify-content-between align-items-center mb-2'>
									<h3 className='card-title mb-0'>{event.name}</h3>
									{event.status === EventStatus.DEACTIVATED ? (
										<FontAwesomeIcon icon={faExclamationTriangle} className='text-danger' />
									) : event.status === EventStatus.DISABLED ? (
										<FontAwesomeIcon icon={faBan} className='text-warning' />
									) : event.status === EventStatus.HIDDEN ? (
										<FontAwesomeIcon icon={faEyeSlash} className='text-warning' />
									) : null}
								</div>
								<p className='text-muted card-subtitle mb-2 text-truncate'>
									<ClientTime date={event.startDate} />
								</p>
								<p className='text-muted card-subtitle mb-2 text-truncate'>{event.location}</p>
								<p className='text-muted card-subtitle mb-2 text-truncate'>Owner: {event.owner === true ? "You" : event.owner.firstName + " " + event.owner.lastName}</p>
								<p className='card-text overflow-hidden mb-1 flex-grow-1' style={{ height: 0 }}>
									{event.shortDescription}
								</p>
							</div>
							{event.status === EventStatus.DEACTIVATED ? (
								<p className='text-danger mb-0 text-center'>This event has been deactivated and is no longer available. Please contact support</p>
							) : event.status === EventStatus.DISABLED ? (
								<>
									<p className='text-warning mb-1 text-center'>You have disabled this event</p>
									<form action={formAction}>
										<input type='hidden' name='event' value={event.uuid} />
										<input type='hidden' name='action' value='enable' />
										<button className='btn btn-outline-warning w-100' type='submit' disabled={pending}>
											Enable
										</button>
									</form>
								</>
							) : (
								<div className='mt-auto'>
									{event.status === EventStatus.HIDDEN && <p className='text-warning mb-1 text-center'>This event is not public</p>}
									{currentEventId === event.id ? (
										<Link href='/admin/overview' className='btn btn-primary w-100'>
											Currently Selected
										</Link>
									) : (
										<form action={formAction}>
											<input type='hidden' name='event' value={event.uuid} />
											<input type='hidden' name='action' value='select' />
											<button className={`btn btn-primary w-100`} disabled={pending} type='submit'>
												Open
											</button>
										</form>
									)}
								</div>
							)}
						</div>
					</div>
				</SwiperSlide>
			))}
			<SwiperSlide key='new' className='h-auto' style={{ maxWidth: "400px", minHeight: "500px" }}>
				<div className='card h-100 d-flex align-items-center justify-content-center'>
					<Link className='stretched-link' href='/admin/events/new'>
						<FontAwesomeIcon icon={faPlus} size='2x' />
					</Link>
				</div>
			</SwiperSlide>
			<div className='px-4 position-relative mt-4'>
				<div className='swiper-scrollbar w-100 start-0 top-0 shadow' style={{ "--swiper-scrollbar-drag-bg-color": "var(--bs-light)", "--swiper-scrollbar-bg-color": "#444" } as React.CSSProperties} />
			</div>
			<p>{state}</p>
		</Swiper>
	);
}
