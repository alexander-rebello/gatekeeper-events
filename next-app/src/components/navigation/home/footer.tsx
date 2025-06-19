import Link from "next/link";

export default function Footer() {
	return (
		<div className="bg-body">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 180">
				<path fill="rgb(var(--bs-secondary-bg-rgb))" fillOpacity="1" d="M0,63L48,63C96,63,192,63,288,89.69999999999999C384,116,480,170,576,175C672,180,768,138,864,95C960,52,1056,10,1152,4.299999999999997C1248,-1,1344,31,1392,47L1440,63L1440,255L1392,255C1344,255,1248,255,1152,255C1056,255,960,255,864,255C768,255,672,255,576,255C480,255,384,255,288,255C192,255,96,255,48,255L0,255Z"></path>
			</svg>
			<footer className="bg-body">
				<div className="text-center bg-body-secondary">
					<div className="container text-muted py-4 py-lg-5">
						<p>
							Bereitgestellt von&nbsp;
							<Link className="text-uppercase fs-3 quantum text-g" href="/">
								GateKeeper
							</Link>
						</p>
						<ul className="list-inline">
							<li className="list-inline-item me-4">
								<Link href="/impressum">Impressum</Link>
							</li>
							<li className="list-inline-item me-4">
								<Link href="/datenschutz">Datenschutz</Link>
							</li>
							<li className="list-inline-item">
								<Link href="/#contact">Kontakt</Link>
							</li>
						</ul>
						<p className="text-light mb-0">Copyright © 2023-{new Date().getFullYear()} GateKeeper</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
