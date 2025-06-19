"use client";
import BaseTile from "@/components/tiles/base-tile";
import { getInfoData, localData } from "../../utils";
import { z } from "zod";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export type Ticket = {
	id: number;
	title: string;
	color: string;
};

export default function PageContent({ uuid, token, tickets }: { uuid: string; token: string; tickets: Ticket[] }) {
	const [ticketNames, setTicketNames] = useState<{ id: number; names: string[] }[] | undefined>(undefined);

	const [firstName, setFirstName] = useState<string | undefined>(undefined);
	const [lastName, setLastName] = useState<string | undefined>(undefined);
	const [email, setEmail] = useState<string | undefined>(undefined);
	const [message, setMessage] = useState<string | undefined>(undefined);

	const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
	const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [namesError, setNamesError] = useState<string | undefined>(undefined);

	const router = useRouter();

	useEffect(() => {
		if (ticketNames !== undefined) localData.set("data-" + uuid, JSON.stringify({ firstName: firstName, lastName: lastName, email: email, message: message, ticketNames: ticketNames }));
	}, [firstName, lastName, email, message, ticketNames]);

	useEffect(() => {
		const { firstName: newFirstName, lastName: newLastName, email: newEmail, message: newMessage, ticketNames: newTicketNames, cartData } = getInfoData(uuid);

		if (cartData.cart.length === 0) redirect("/event/" + token + "/tickets");

		setTicketNames(newTicketNames);
		setFirstName(newFirstName);
		setLastName(newLastName);
		setEmail(newEmail);
		setMessage(newMessage);
	}, []);

	const submit = () => {
		let allCorrect = 0;

		if (!firstName) setFirstNameError("notwendig");
		else if (firstName.length < 3) setFirstNameError("min. 3 Zeichen");
		else if (firstName.length > 32) setFirstNameError("max. 32 Zeichen");
		else {
			allCorrect += 1;
			setFirstNameError(undefined);
		}

		if (!lastName) setLastNameError("notwendig");
		else if (lastName.length < 3) setLastNameError("min. 3 Zeichen");
		else if (lastName.length > 32) setLastNameError("max. 32 Zeichen");
		else {
			allCorrect += 1;
			setLastNameError(undefined);
		}

		if (!email) setEmailError("notwendig");
		else if (!z.string().email().safeParse(email).success) setEmailError("ungültig");
		else {
			allCorrect += 1;
			setEmailError(undefined);
		}

		if (!ticketNames || ticketNames.length === 0) {
			setNamesError("Bitte gib für jedes Ticket einen Namen an");
			return;
		}

		let ticketNamesValid = true;

		outer: for (const ticket of ticketNames) {
			// Check if all names are set and not empty, and length constraints
			for (const name of ticket.names) {
				if (!name || name.trim().length === 0) {
					setNamesError("Bitte gib für jedes Ticket einen Namen an");
					ticketNamesValid = false;
				} else if (name.trim().length < 4) {
					setNamesError("Jeder Name muss min. 4 Zeichen haben");
					ticketNamesValid = false;
				} else if (name.trim().length > 100) {
					setNamesError("Jeder Name darf max. 100 Zeichen haben");
					ticketNamesValid = false;
				}

				if (!ticketNamesValid) break outer;
			}

			// Check for duplicate names within the same ticket type
			const nameSet = new Set(ticket.names.map((n) => n.trim().toLowerCase()));
			if (nameSet.size !== ticket.names.length) {
				setNamesError("Jeder Name darf pro Ticket-Typ nur einmal vergeben werden");
				ticketNamesValid = false;
				break;
			}
		}

		if (ticketNamesValid) {
			allCorrect += 1;
			setNamesError(undefined);
		}

		if (allCorrect === 4) {
			router.push("/event/" + token + "/checkout");
		}
	};

	const setName = (typeId: number, index: number, name: string) => {
		if (ticketNames === undefined) return;
		const newTicketNames = [...ticketNames];
		newTicketNames.map((value) => {
			if (value.id !== typeId) return value;

			let names = value.names;
			names[index] = name;
			return { id: typeId, names: names };
		});
		setTicketNames(newTicketNames);
	};

	return (
		<div className='row justify-content-center'>
			<div className='col-11'>
				<BaseTile>
					<div className='row justify-content-center gy-4' style={{ minHeight: "500px" }}>
						<div className='col-12 col-lg-5 position-relative'>
							<BaseTile title='Details' className='shadow bigger-card-lg-left'>
								<div className='px-2 d-flex flex-column h-100'>
									<div className='row gy-3 mb-3'>
										<div className='col-12'>
											<label className='form-label' htmlFor='firstName'>
												Vorname<span className='text-danger'>* {firstNameError}</span>
											</label>
											<input className='bg-light bg-opacity-10 border-light form-control shadow-sm' type='text' placeholder='Vorname' value={firstName} onChange={(e) => setFirstName(e.target.value)} required name='firstName' id='firstName' />
										</div>
										<div className='col-12'>
											<label className='form-label' htmlFor='lastName'>
												Nachname<span className='text-danger'>* {lastNameError}</span>
											</label>
											<input className='bg-light bg-opacity-10 border-light form-control shadow-sm' type='text' placeholder='Nachname' value={lastName} onChange={(e) => setLastName(e.target.value)} required name='lastName' id='lastName' />
										</div>
									</div>
									<div className='mb-3'>
										<label className='form-label' htmlFor='email'>
											E-Mail Adresse<span className='text-danger'>* {emailError}</span>
										</label>
										<input className='bg-light bg-opacity-10 border-light form-control shadow-sm' type='email' placeholder='beispiel@gatekeeper.de' value={email} onChange={(e) => setEmail(e.target.value)} required name='email' id='email' />
									</div>
									<div className='mb-3 flex-grow-1 d-flex flex-column'>
										<label className='form-label' htmlFor='message'>
											Anmerkungen
										</label>
										<textarea className='bg-light bg-opacity-10 border-light form-control shadow-sm flex-grow-1' placeholder='Möchten Sie uns etwas mitteilen?' style={{ resize: "none", minHeight: "100px" }} value={message} onChange={(e) => setMessage(e.target.value)} name='message' id='message' />
									</div>
								</div>
							</BaseTile>
						</div>
						<div className='col-12 col-lg-7 d-flex flex-column py-3 px-xl-4'>
							<h2 className='mb-0'>Personalisiere deine Tickets</h2>
							<p className='mb-4 lh-1 text-muted'>Gib hier bitte die Namen der Ticketbesitzer an</p>
							<div className='mb-3'>
								{ticketNames &&
									ticketNames.map((ticket, i) => {
										const ticketType = tickets.find((value) => value.id === ticket.id);
										if (!ticketType) return null;

										return ticket.names.map((name, j) => (
											<div className='mb-3 input-group' key={i + "-" + j}>
												<span className='bg-light bg-opacity-10 border-light input-group-text' style={{ color: ticketType.color }}>
													{ticketType.title}
												</span>
												<input className='bg-light bg-opacity-10 border-light form-control shadow-sm' placeholder={`Name für ${ticketType.title} Ticket ${j + 1}`} type='text' value={name} onChange={(e) => setName(ticket.id, j, e.target.value)} />
											</div>
										));
									})}
									<span className='text-danger'>&nbsp;{namesError}</span>
							</div>
							<div className='d-flex justify-content-between mt-auto'>
								<Link className='btn btn-outline-success d-flex justify-content-center align-items-center px-4' href={`/event/${token}/tickets`}>
									<FontAwesomeIcon icon={faChevronLeft} className='me-2' />
									Zurück
								</Link>
								<button className='btn btn-success d-flex justify-content-center align-items-center px-4' type='button' onClick={submit}>
									Weiter
									<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
								</button>
							</div>
						</div>
					</div>
				</BaseTile>
			</div>
		</div>
	);
}
