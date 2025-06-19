import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Impressum",
};

export default function Datenschutz() {
	return (
		<section className='pt-5'>
			<div className='container mt-5'>
				<div className='row'>
					<div className='col-12'>
						<h1>Impressum</h1>

						<p>
							Alexander Rebello
							<br />
							Gatekeeper Events
						</p>

						<h2>Kontakt</h2>
						<p>E-Mail: info@gatekeeper-events.de</p>

						<h2>EU-Streitschlichtung</h2>
						<p>
							Die Europ&auml;ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
							<a href='https://ec.europa.eu/consumers/odr/' target='_blank' rel='noopener noreferrer'>
								https://ec.europa.eu/consumers/odr/
							</a>
							<br /> Unsere E-Mail-Adresse finden Sie oben im Impressum.
						</p>

						<h2>Verbraucher&shy;streit&shy;beilegung/Universal&shy;schlichtungs&shy;stelle</h2>
						<p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

						<h2>Zentrale Kontaktstelle nach dem Digital Services Act - DSA (Verordnung (EU) 2022/265)</h2>
						<p>Unsere zentrale Kontaktstelle f&uuml;r Nutzer und Beh&ouml;rden nach Art. 11, 12 DSA erreichen Sie wie folgt:</p>
						<p>
							E-Mail: info@gatekeeper-events.de
							<br />
							Telefon: 017665857007
						</p>
						<p>Die für den Kontakt zur Verf&uuml;gung stehenden Sprachen sind: Deutsch, Englisch.</p>
						<p>
							Quelle: <a href='https://www.e-recht24.de'>eRecht24</a>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
