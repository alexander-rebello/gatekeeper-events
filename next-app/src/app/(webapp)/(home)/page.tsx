import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/app/(webapp)/(home)/_sections/form";
import TestimonialsSlider from "@/app/(webapp)/(home)/_sections/testimonialsSlider";
import type { TestimonialSlides } from "@/app/(webapp)/(home)/_sections/testimonialsSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning, faChevronRight, faFire, faFireFlameCurved, faTools } from "@fortawesome/free-solid-svg-icons";
import PricingSection from "./_sections/pricing/pricingSection";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Home",
};

export default function Home() {
	let slides: TestimonialSlides = { items: [] };

	return (
		<>
			<section id='hero' className='overflow-hidden position-relative'>
				<div className='container vh-100'>
					<div className='row h-100'>
						<div className='col-md-6 text-center text-md-start d-flex d-sm-flex d-md-flex justify-content-center align-items-center justify-content-md-start align-items-md-center justify-content-xl-center'>
							<div className='text-white' style={{ maxWidth: "350px" }}>
								<h1 className='text-uppercase fw-bold fenix'>Digitale Tickets für dein Event verkaufen</h1>
								<p className='my-3'>
									Digitale Tickets erstellen und online verkaufen, komplett&nbsp;<span>kostenlos</span>!
								</p>
								<div>
									<Link className='me-2 btn btn-primary btn-lg' href='/signup'>
										<span>Los geht&apos;s</span>
										<FontAwesomeIcon icon={faChevronRight} className='ms-1' />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 160' className='position-absolute bottom-0'>
					<path
						fill='var(--bs-body-bg)'
						fillOpacity='1'
						d='M0,97L48,113C96,129,192,161,288,150.3C384,140,480,86,576,59.69999999999999C672,33,768,33,864,49C960,65,1056,97,1152,91.69999999999999C1248,86,1344,44,1392,22.30000000000001L1440,1L1440,193L1392,193C1344,193,1248,193,1152,193C1056,193,960,193,864,193C768,193,672,193,576,193C480,193,384,193,288,193C192,193,96,193,48,193L0,193Z'
					></path>
				</svg>
			</section>
			<section id='features' className='bg-body overflow-hidden pb-5'>
				<div className='container'>
					<div className='row mb-5'>
						<div className='col-md-10 col-xl-8 text-center mx-auto'>
							<h2 className='fw-bold fenix'>Warum wir?</h2>
							<p className='w-lg-50'>Wir versuchen alle notwendigen Funktionen bereitzustellen, um das Management Ihrer Events so reibungslos wie möglich verlaufen zu lassen!</p>
						</div>
					</div>
					<div className='row row gx-5 gy-5 justify-content-center mb-5'>
						<div className='col-12 col-sm-10 col-md-6 col-xl-4'>
							<div className='d-flex align-items-center h-100 position-relative'>
								<FontAwesomeIcon icon={faBoltLightning} size='3x' width={"3rem"} className='text-warning me-3' />
								<div className='d-flex flex-column'>
									<h3 className='fenix'>Schnell</h3>
									<p className='flex-grow-1 mb-3'>Unsere App wurde mit aktuellen Standards entwickelt, um so schnell wie möglich zu sein!</p>
								</div>
							</div>
						</div>
						<div className='col-12 col-sm-10 col-md-6 col-xl-4'>
							<div className='d-flex align-items-center h-100 position-relative'>
								<FontAwesomeIcon icon={faTools} size='3x' width={"3rem"} className='text-success me-3' />
								<div className='d-flex flex-column h-100'>
									<h3 className='fenix'>Vielseitig</h3>
									<p className='flex-grow-1 mb-3'>Das Admin Panel ist mit vielen verschiedenen Funktionen und Fähigkeiten ausgestattet!</p>
								</div>
							</div>
						</div>
						<div className='col-12 col-sm-10 col-md-6 col-xl-4'>
							<div className='d-flex align-items-center h-100 position-relative'>
								<FontAwesomeIcon icon={faFireFlameCurved} size='3x' width={"3rem"} className='text-danger me-3' />
								<div className=''>
									<h3 className='fenix'>Kostenlos</h3>
									<p className='flex-grow-1 mb-3'>Unsere App ist komplett kostenlos, solange ihr Event einem guten Zweck dient!</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section id='space' className='overflow-hidden position-relative'>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 160' className='position-relative'>
					<path
						fill='var(--bs-body-bg)'
						fillOpacity='1'
						d='M0,92L48,108C96,124,192,156,288,156C384,156,480,124,576,86.69999999999999C672,49,768,7,864,1.2999999999999972C960,-4,1056,28,1152,54.69999999999999C1248,81,1344,103,1392,113.30000000000001L1440,124L1440,-100L1392,-100C1344,-100,1248,-100,1152,-100C1056,-100,960,-100,864,-100C768,-100,672,-100,576,-100C480,-100,384,-100,288,-100C192,-100,96,-100,48,-100L0,-100Z'
					></path>
				</svg>
				<div className='container py-5 mt-5 mb-4'>
					<div className='row justify-content-center g-5'>
						<div className='col-10 col-sm-8 col-md-6 col-lg-4'>
							<img className='img-fluid rounded' src='/img/mockup.png' style={{ filter: "brightness(0.75)" }} />
						</div>
						<div className='col-12 text-center col-md-6 text-md-start col-lg-5 col-xl-4 d-flex align-items-center'>
							<h2>Manage deine Events in einem modernen und vielseitigen Admin Panel</h2>
						</div>
					</div>
				</div>

				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 155'>
					<path
						fill='var(--bs-body-bg)'
						fillOpacity='1'
						d='M0,0L48,21.30000000000001C96,43,192,85,288,101.30000000000001C384,117,480,107,576,90.69999999999999C672,75,768,53,864,37.30000000000001C960,21,1056,11,1152,26.69999999999999C1248,43,1344,85,1392,106.69999999999999L1440,128L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z'
					></path>
				</svg>
			</section>
			<section id='testimonials' className='bg-body pt-2 pb-5'>
				<div className='container py-4 py-xl-5'>
					<div className='row mb-5'>
						<div className='col-md-8 col-xl-6 text-center mx-auto'>
							<h2 className='fw-bold'>Bewertungen</h2>
						</div>
					</div>
				</div>
				<TestimonialsSlider slides={slides} />
			</section>
			<section id='pricing' className='position-relative overflow-hidden'>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 169'>
					<path
						fill='var(--bs-body-bg)'
						fillOpacity='1'
						d='M0,156L48,161.3C96,167,192,177,288,145.3C384,113,480,39,576,12C672,-15,768,7,864,49.3C960,92,1056,156,1152,166.7C1248,177,1344,135,1392,113.30000000000001L1440,92L1440,-68L1392,-68C1344,-68,1248,-68,1152,-68C1056,-68,960,-68,864,-68C768,-68,672,-68,576,-68C480,-68,384,-68,288,-68C192,-68,96,-68,48,-68L0,-68Z'
					></path>
				</svg>

				<PricingSection />

				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 180'>
					<path
						fill='var(--bs-body-bg)'
						fillOpacity='1'
						d='M0,38L48,27.299999999999997C96,17,192,-5,288,6C384,17,480,59,576,102C672,145,768,187,864,166C960,145,1056,59,1152,27.299999999999997C1248,-5,1344,17,1392,27.299999999999997L1440,38L1440,230L1392,230C1344,230,1248,230,1152,230C1056,230,960,230,864,230C768,230,672,230,576,230C480,230,384,230,288,230C192,230,96,230,48,230L0,230Z'
					></path>
				</svg>
			</section>
			<section id='contact' className='bg-body position-relative pt-4 pt-xl-5'>
				<div className='container position-relative'>
					<div className='row'>
						<div className='col-md-8 col-xl-6 text-center mx-auto'>
							<h2 className='fw-bold'>Kontaktiere Sie uns</h2>
							<p className='w-lg-50'>Bei Fragen oder Anregungen schreiben Sie uns gerne. Wir melden uns so schnell wie möglich bei Ihnen!</p>
						</div>
					</div>
					<div className='row justify-content-center'>
						<div className='col-12 col-md-8'>
							<div className='blur'>
								<ContactForm />
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
