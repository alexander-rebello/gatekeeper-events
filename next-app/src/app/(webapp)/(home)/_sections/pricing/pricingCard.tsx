import Link from "next/link";
import PricingBenefit from "./pricingBenefit";

export default function PricingCard({ benefits, upgradeBenefits, title, subtitle, action, actionName, badge }: { benefits: string[]; upgradeBenefits: string[]; title: string; subtitle: string; action: string; actionName: string; badge?: string }) {
	return (
		<div className='card text-light bg-transparent blur h-100'>
			<div className='card-header text-center bg-secondary bg-opacity-50 border-0 p-4'>
				{badge && <span className='badge rounded-pill bg-primary position-absolute top-0 start-50 translate-middle text-uppercase'>Most Popular</span>}
				<h6 className='text-uppercase text-white-50'>{subtitle.toUpperCase()}</h6>
				<h4 className='fs-1 fw-bold text-white quantum'>{title}</h4>
			</div>
			<div className='card-body text-white bg-secondary bg-opacity-25 border-0 p-4 d-flex flex-column'>
				<div className='flex-grow-1'>
					<ul className='list-unstyled'>
						{benefits.map((item, i) => (
							<PricingBenefit content={item} key={i} bg='primary' color='white' />
						))}
						{upgradeBenefits.map((item, i) => (
							<PricingBenefit content={item} key={i} bg='success' color='white' />
						))}
					</ul>
				</div>
				<Link className='btn btn-primary d-block w-100 shadow-lg' href={action}>
					{actionName}
					<svg xmlns='http://www.w3.org/2000/svg' viewBox='-96 0 512 512' width='1em' height='1em' fill='currentColor' className='ms-1 mb-2'>
						<path d='M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z'></path>
					</svg>
				</Link>
			</div>
		</div>
	);
}
