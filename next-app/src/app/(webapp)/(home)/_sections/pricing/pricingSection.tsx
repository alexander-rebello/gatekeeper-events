import Link from "next/link";
import PricingCard from "./pricingCard";

export default function PricingSection() {
	let benefitsOne = ["Tickets per Mail verschicken", "QR-Code Scan App"];
	let benefitsTwo = ["Bis zu 750 Tickets", "Online Zahlungen", "1 Sponsoren Banner"];
	let benefitsThree = ["Mehr als 750 Tickets", "Online Zahlungen", "3 Sponsoren Banner", "Individuelles Ticket-Design"];

	return (
		<div className='container py-4 py-xl-5 mb-5'>
			<div className='row mb-5'>
				<div className='col-md-8 col-xl-6 text-center mx-auto'>
					<h2 className='fw-bold'>Packete</h2>
					<p className='w-lg-50'>Für kleine Events stellen wir eine kostenlose Lösung dar. Aber auch für anspruchsvolle Events sind wir die richtige Platform.</p>
				</div>
			</div>
			<div className='row gy-4 d-xl-flex justify-content-center'>
				<div className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
					<PricingCard subtitle='Standard' title='Free' action='/signup' actionName='Starten' benefits={benefitsOne} upgradeBenefits={["Bis zu 250 Tickets"]} />
				</div>
				<div className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
					<PricingCard subtitle='Premium' title='1% Einnahmen' badge='Most Popular' action='/#contact' actionName='Kontaktieren Sie uns' benefits={benefitsOne} upgradeBenefits={benefitsTwo} />
				</div>
				<div className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4'>
					<PricingCard subtitle='Business' title='Individuell' action='/#contact' actionName='Kontaktieren Sie uns' benefits={benefitsOne} upgradeBenefits={benefitsThree} />
				</div>
			</div>
		</div>
	);
}
