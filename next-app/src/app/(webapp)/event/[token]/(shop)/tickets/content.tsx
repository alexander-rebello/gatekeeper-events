"use client";

import BaseTile from "@/components/tiles/base-tile";
import { faChevronRight, faMinus, faPlus, faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { getCartData, setCartData } from "../../utils";
import Link from "next/link";
import Image from "next/image";

export type Ticket = {
	id: number;
	title: string;
	price: number;
	description: string | null;
	color: string;
	available: number;
};

export type CartItem = { id: number; amount: number };

export default function PageContent({ tickets, image, uuid, token }: { tickets: Ticket[]; image: string | null; uuid: string; token: string }) {
	const [cart, setCart] = useState<CartItem[] | undefined>(undefined);
	const [cartValue, setCartValue] = useState<number>(0);
	const [itemCount, setItemCount] = useState<number>(0);

	useEffect(() => {
		const { cart: newCart } = getCartData(uuid);
		setCart(newCart);
	}, []);

	useEffect(() => {
		if (cart !== undefined) {
			setCartData(uuid, cart);
			setItemCount(cart.reduce((acc, item) => acc + item.amount, 0));

			const value = cart.reduce((acc, item) => {
				const ticket = tickets.find((ticket) => ticket.id === item.id);
				if (!ticket) return acc;
				return acc + item.amount * ticket.price;
			}, 0);

			setCartValue(value);
		}
	}, [cart]);

	const add = (id: number) => {
		if (!cart) return;
		const amount = cart.find((item) => item.id === id)?.amount;
		set(id, amount ? amount + 1 : 1);
	};

	const remove = (id: number) => {
		if (!cart) return;
		const amount = cart.find((item) => item.id === id)?.amount;

		set(id, amount && amount > 0 ? amount - 1 : 0);
	};

	const set = (id: number, value: number) => {
		if (!cart) return;
		setCart((prevCart) => {
			const newCart = [...(prevCart || [])];
			const itemIndex = newCart.findIndex((item) => item.id === id);
			const ticket = tickets.find((ticket) => ticket.id === id);
			if (ticket && itemIndex === -1) {
				if (value > 0) newCart.push({ id, amount: value });
			} else if (ticket && value > 0) {
				if (ticket.available !== -1 && value >= ticket.available) newCart[itemIndex].amount = ticket.available;
				else newCart[itemIndex].amount = value;
			} else {
				newCart.splice(itemIndex, 1);
			}
			return newCart;
		});
	};

	const reset = () => {
		setCart([]);
	};

	return (
		<div className='row gy-4'>
			<div className='col-12 col-lg-8 d-flex flex-column'>
				<BaseTile className='mb-4 h-100' title='Tickets'>
					<div className='pt-4 h-100'>
						<div className='row justify-content-center gy-4 h-100'>
							{tickets.map((ticket, i) => {
								const soldOut = ticket.available === 0;
								const amount = cart?.find((item) => item.id === ticket.id)?.amount || 0;
								return (
									<div key={i} className='col-12 col-md-6 col-xl-4'>
										<div className='card bg-light bg-opacity-10 border rounded shadow-lg h-100'>
											<div className='card-body text-center d-flex flex-column'>
												<div className='mb-auto'>
													<div className='position-absolute' style={{ transform: "translateX(-50%) translateY(-75%)", left: "50%" }}>
														<FontAwesomeIcon icon={faTicket} size='2x' style={{ color: ticket.color, transform: "rotate(-15deg)" }} />
													</div>
													<h2 className='mb-0 lh-1 mt-3'>{ticket.title}</h2>
													<p className='fs-6'>{ticket.description}</p>
												</div>
												<p className='fs-3 fenix'>{ticket.price.toFixed(2).replace(".", ",").replace(",00", ",-")} €</p>
												{soldOut ? (
													<p className='text-danger'>Ausverkauft</p>
												) : (
													<>
														<div className='input-group mb-2 num'>
															<button className='btn btn-primary' type='button' onClick={() => remove(ticket.id)}>
																<FontAwesomeIcon icon={faMinus} />
															</button>
															<input className='bg-light bg-opacity-25 border-0 form-control p-0 text-body text-center fs-4 fenix' type='number' value={amount} onChange={(e) => set(ticket.id, parseInt(e.target.value))} min='0' />
															<button className='btn btn-primary' type='button' onClick={() => add(ticket.id)}>
																<FontAwesomeIcon icon={faPlus} />
															</button>
														</div>
														{ticket.available === -1 ? (
															<p className='text-muted mb-0'>Unbegrenzt verfügbar</p>
														) : (
															<p className='text-muted mb-0'>Noch {ticket.available} verfügbar</p>
														)}
													</>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</BaseTile>
				{image && <Image src={image} alt='Sponsor 3' width={1000} height={300} className='img-fluid rounded-3 shadow-lg mb-4' />}
			</div>
			<div className='col-12 col-lg-4 d-flex flex-column'>
				<BaseTile className='mb-4' title={`Bestellung (${itemCount})`}>
					<div className='table-responsive bg-transparent mb-auto' style={{ minHeight: "250px" }}>
						<table className='table table-striped table-borderless'>
							<tbody className='show-cart'>
								{cart && cart.length > 0 ? (
									cart.map((item) => {
										const ticket = tickets.find((ticket) => ticket.id === item.id);
										if (!ticket) return null;
										return (
											<tr key={item.id}>
												<td className='ps-3'>
													<div className='d-flex align-items-center'>
														<FontAwesomeIcon icon={faTicket} className='me-3' style={{ color: ticket.color }} />
														<div className='flex-grow-1'>
															<p className='fs-4 mb-0 lh-1'>{ticket.title}</p>
															<p className='fs-6 text-muted mb-0 ps-1 fenix'>
																{item.amount} x {ticket.price.toFixed(2).replace(".", ",").replace(",00", ",-")} €
															</p>
														</div>
													</div>
												</td>
												<td className='pe-3'>
													<div className='d-flex flex-column align-items-end'>
														<p className='fs-4 mb-0 fenix lh-1'>{ticket.price.toFixed(2).replace(".", ",").replace(",00", ",-")}€</p>
														<a className='fs-6 link-danger link-opacity-75' onClick={() => set(item.id, 0)}>
															Löschen
														</a>
													</div>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td className='text-center'>Keine Tickets ausgewählt</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<hr />
					<div className='d-flex justify-content-between align-items-center'>
						<p className='fs-4 mb-0 lh-1'>Summe:</p>
						<p className='fs-3 mb-0 fenix lh-1'>{cartValue.toFixed(2).replace(".", ",").replace(",00", ",-")} €</p>
					</div>
					<hr />
					<div className='d-flex'>
						<button className='btn btn-outline-danger flex-grow-1 me-2 flex-basis-0 clear-cart' type='button' onClick={() => reset()}>
							Zurücksetzen
						</button>
						<Link className={`btn btn-${cart && cart.length > 0 ? "success" : "outline-success disabled"} flex-grow-1 flex-basis-0`} href={cart && cart.length > 0 ? `/event/${token}/details` : ""}>
							Weiter
							<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
						</Link>
					</div>
				</BaseTile>
			</div>
		</div>
	);
}
