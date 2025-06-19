export default function PageLayout({ children, title, action }: { children: React.ReactNode; title: String | React.ReactNode; action?: React.ReactNode }) {
	return (
		<>
			<section className='px-xl-4 pt-5'>
				<div className='container-fluid'>
					<div className='row'>
						<div className='col-12 d-flex justify-content-between align-items-center mb-4 px-4'>
							<h1 className='text-white me-auto'>{title}</h1>
							{action ? action : null}
						</div>
					</div>
					<div className='row gy-4 justify-content-center mb-4'>{children}</div>
				</div>
			</section>
		</>
	);
}
