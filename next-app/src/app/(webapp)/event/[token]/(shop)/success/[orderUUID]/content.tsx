"use client";
import { getStatusColor, getStatusIcon } from "@/components/utils";
import { faLink, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import IBANButton from "./ibanButton";
import Purger from "./purger";

export type Order = {
	uuid: string;
	event: {
		uuid: string;
		bank: string | null;
		payment_link: string | null;
		minor_allowance: boolean;
	};
	status: {
		value: string;
	};
};

export default function PageContent({ order }: { order: Order }) {
	const [show, setShow] = useState(true);

	const handleClose = () => setShow(false);

	return (
		<>
			<button className='btn btn-primary position-fixed top-0 end-0 mt-5 rounded-0 rounded-start px-4' onClick={() => setShow(true)}>
				Spenden 🥳
			</button>
			<Modal show={show} onHide={handleClose} centered backdrop='static' keyboard={false} size='lg' contentClassName='bg-white text-dark'>
				<Modal.Header>
					<Modal.Title>Unterstütze dieses Tool</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						Dieses Tool wurde von Schülern für Schüler entwickelt und kostenlos bereitgestellt, damit Abijahrgänge und andere Veranstallter unkompliziert Tickets für ihre Events (wie den Abiball) verkaufen können. Wenn euch das Tool gefällt und ihr den Service schätzt, freuen wir uns über jede
						Spende - nur so können wir das Angebot am Leben erhalten und unsere laufenden Kosten finanzieren. Danke, dass ihr dazu beitragt!
						<br />
						<br />
						Eurer Gatekeeper-Team
					</p>
				</Modal.Body>
				<Modal.Footer>
					<button className='btn btn-outline-danger px-4' onClick={handleClose}>
						Schließen 🥺
					</button>
					<Link href='https://paypal.me/annabi2024' className='btn btn-success px-4'>
						Spenden 🥳
					</Link>
				</Modal.Footer>
			</Modal>
			<div className='row justify-content-center'>
				<div className='col-12 col-md-10 col-lg-8 col-xl-6 text-center text-dark'>
					<Purger eventUUid={order.event.uuid} />
					<h1>Die Bestellung wurde erfolgreich aufgegeben.</h1>
					<p>
						Du erhälst eine Email mit weiteren Informationen. Wenn du keine E-Mail von uns erhalten hast, prüfe bitte deinen Spam-Ordner. Falls auch da nichts zu finden ist, kontaktiere uns gerne.
						<br />
						<br />
						Die Bestell ID: {order.uuid}
						<br />
						Status:{" "}
						<span className={"text-" + getStatusColor(order.status.value)}>
							<FontAwesomeIcon icon={getStatusIcon(order.status.value)} /> {order.status.value}
						</span>
						<br />
						<br />
					</p>
					{(order.event.bank || order.event.payment_link) && (
						<>
							<h3 className='mb-3 mt-auto'>Zahlungsmethode(n)</h3>
							<div className='text-start pb-4'>
								{order.event.bank && <IBANButton iban={order.event.bank} />}
								{order.event.payment_link && (
									<div className='bg-light bg-opacity-10 d-flex justify-content-between align-items-center px-3 py-2 rounded-3 position-relative ms-sm-2 shadow border border-light'>
										<div>
											<p className='text-body-emphasis mb-0'>Payment Link</p>
											<p className='fs-6 text-muted fenix mb-0 lh-1'>{order.event.payment_link}</p>
										</div>
										<Link className='stretched-link text-primary text-decoration-none' href={order.event.payment_link} target='_blank'>
											<FontAwesomeIcon icon={faLink} />
										</Link>
									</div>
								)}
							</div>
						</>
					)}
					{order.event.bank === null && order.event.payment_link === null ? <p className='text-muted'>Keine Zahlungsmethoden angegeben. Kontaktieren Sie den Veranstalter.</p> : null}
					{order.event.minor_allowance && (
						<p className='text-muted'>
							Minderjährige Gäste benötigen auf dieser Veranstaltung einen "Muttizettel". Laden Sie hier unsere Vorlage herrunter:
							<Link download={true} href={"/muttizettel.pdf"} className='ms-2'>
								<FontAwesomeIcon icon={faDownload} /> Muttizettel
							</Link>
						</p>
					)}
				</div>
			</div>
		</>
	);
}
