import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-body">
			<div className="text-center bg-body-secondary bg-opacity-75">
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
	);
}
