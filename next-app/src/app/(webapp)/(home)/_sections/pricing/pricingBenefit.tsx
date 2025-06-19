export default function PricingBenefit({ content, bg = "primary", color = "white" }: { content: string; bg?: string; color?: string }) {
	return (
		<li className='d-flex mb-2'>
			<span className={`bg-${bg} text-${color} bg-opacity-50 border rounded border-0 d-flex justify-content-center align-items-center me-2 pt-0 w-h-30`}>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='-32 0 512 512' width='1em' height='1em' fill='currentColor'>
					<path d='M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z'></path>
				</svg>
			</span>
			<span>{content}</span>
		</li>
	);
}
