import { Color } from "../../utils";

export default function StatisticsTile({ className, color, title, subtitle, value, children }: { className: string; color: Color; title: string; subtitle?: string | React.ReactNode; value: string | React.ReactNode; children: React.ReactNode }) {
	return (
		<div className={className}>
			<div className={`card bg-body-secondary border-${color} border-5 shadow-lg border-0 border-start`}>
				<div className='card-body d-flex align-items-center px-4 py-2'>
					<div className='flex-grow-1 pe-3'>
						<h4 className='mb-0'>{title}</h4>
						<p className='fs-3 text-muted mb-0 fenix lh-1'>{value}</p>
						{subtitle && <p className='fs-6 text-body-tertiary mb-0 fenix lh-1'>{subtitle}</p>}
					</div>
					<div className={`fs-1 text-${color} d-flex`}>{children}</div>
				</div>
			</div>
		</div>
	);
}
