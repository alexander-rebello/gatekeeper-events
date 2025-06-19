export default function BaseTile({ children, className = "", title, subtitle, style = {} }: { children: React.ReactNode; className?: string; title?: string | React.ReactNode; subtitle?: string | React.ReactNode; style?: React.CSSProperties }) {
	return (
		<div className={className} style={style}>
			<div className='card bg-body-secondary border-0 shadow-lg h-100'>
				{title || subtitle ? (
					<div className='card-header bg-light bg-opacity-10 border-0 d-flex align-items-center'>
						{title ? <h3 className='mb-0 me-auto'>{title}</h3> : null}
						{subtitle ? <p className='mb-0 ms-auto text-muted'>{subtitle}</p> : null}
					</div>
				) : null}
				<div className='card-body position-relative d-flex flex-column'>{children}</div>
			</div>
		</div>
	);
}
