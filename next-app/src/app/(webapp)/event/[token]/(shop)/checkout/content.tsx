"use client";
import BaseTile from "@/components/tiles/base-tile";
import { faTicket, faXmark, faArrowRight, faChevronRight, faLink, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { getInfoData } from "../../utils";
import { CartItem, Ticket } from "../tickets/content";
import { getDiscountCodeAction, orderAction } from "./actions";
import { useRouter } from "next/navigation";

export default function PageContent({ uuid, tickets, token }: { uuid: string; tickets: Ticket[]; token: string }) {
	const [cart, setCart] = useState<CartItem[] | undefined>(undefined);
	const [discountCode, setDiscountCode] = useState<string | undefined>(undefined);
	const [validDiscountCode, setValidDiscountCode] = useState<boolean | undefined>(undefined);
	const [cartValue, setCartValue] = useState<number>(0);
	const [discountedCartValue, setDiscountedCartValue] = useState<number | undefined>(0);
	const [itemCount, setItemCount] = useState<number>(0);
	const [info, setInfo] = useState<{ firstName: string; lastName: string; email: string; message?: string; ticketNames: { id: number; names: string[] }[] }>({ firstName: "", lastName: "", email: "", ticketNames: [] });

	const [state, formAction] = useActionState(getDiscountCodeAction, undefined);
	const [error, orderFormAction] = useActionState(orderAction, {});

	const router = useRouter();

	useEffect(() => {
		const { cartData: newCart, email, firstName, lastName, message, ticketNames } = getInfoData(uuid);

		if (!firstName || !lastName || !email) router.push("/event/" + token + "/details");

		setInfo({ firstName: firstName, lastName: lastName, email: email, message: message ? message : undefined, ticketNames: ticketNames });

		if (!newCart || !newCart.cart || newCart.cart.length === 0) router.push("/event/" + token + "/tickets");
		setCart(newCart.cart);
	}, []);

	useEffect(() => {
		if (typeof state === "number") setValidDiscountCode(false);
		else if (state === undefined) setValidDiscountCode(undefined);
		else setValidDiscountCode(true);
	}, [state]);

	useEffect(() => {
		if (validDiscountCode !== undefined) setValidDiscountCode(undefined);
	}, [discountCode]);

	useEffect(() => {
		if (cart) setItemCount(cart.reduce((acc, item) => acc + item.amount, 0));
	}, [cart]);

	useEffect(() => {
		if (!cart) return;
		const value = cart.reduce((acc, item) => {
			const ticket = tickets.find((ticket) => ticket.id === item.id);
			if (!ticket) return acc;
			return acc + item.amount * ticket.price;
		}, 0);

		setCartValue(value);
	}, [cart, state]);

	useEffect(() => {
		if (typeof state === "number" || state === undefined || !validDiscountCode) {
			setDiscountedCartValue(undefined);
		} else {
			let newValue;
			if (state.isPercentage) {
				newValue = cartValue * (1 - state.value);
			} else {
				newValue = cartValue - state.value;
			}
			newValue = Math.max(newValue, 0);
			setDiscountedCartValue(newValue);
		}
	}, [cartValue, state, validDiscountCode]);

	return (
		<div className='row justify-content-center'>
			<div className='col-12 col-lg-10'>
				<BaseTile>
					<div className='row justify-content-center' style={{ minHeight: "500px" }}>
						<div className='col-12 col-lg-7 d-flex flex-column py-3 ps-xl-4'>
							<h3>Details:</h3>
							<div className='ps-3'>
								<p>
									Name: {info.firstName} {info.lastName}
									<br />
									E-Mail: {info.email}
								</p>
							</div>
							<h3>Ablauf:</h3>
							<ul className='mb-3'>
								<li>Du erhälst eine Bestellbestätigung</li>
								<li>
									Bitte bei allen Zahlungsmethoden als <strong>Verwendungzweck den Vor- und Nachnamen</strong> des Käufers angeben
								</li>
								<li>Wir warten auf den Zahlungseingang</li>
								<li>Sobald wir die Zahlung geprüft haben, werden die Tickets freigeschaltet</li>
							</ul>
						</div>
						<div className='col-12 col-md-10 col-lg-5 position-relative'>
							<BaseTile className='shadow-lg bigger-card-lg-right' title={`Bestellung (${itemCount})`}>
								<div className='table-responsive bg-transparent mb-auto'>
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
																			{item.amount} x {ticket.price.toFixed(2)} €
																		</p>
																	</div>
																</div>
															</td>
															<td className='pe-3'>
																<p className='fs-4 mb-0 fenix text-end'>{(item.amount * ticket.price).toFixed(2)}€</p>
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
								<form className='d-flex align-items-center position-relative' action={formAction}>
									<input type='hidden' name='uuid' value={uuid} />
									<div className='input-group mb-0 w-100 shadow-sm rounded'>
										<input
											className={"bg-light bg-opacity-10 form-control text-dark border-" + (validDiscountCode === false ? "danger" : validDiscountCode === undefined ? "light" : "success")}
											type='text'
											placeholder='Rabattcode'
											autoComplete='off'
											value={discountCode}
											onChange={(e) => setDiscountCode(e.target.value)}
											name='code'
											id='code'
										/>
										{validDiscountCode === false ? (
											<span className='input-group-text bg-light bg-opacity-25 border-danger text-danger'>
												<FontAwesomeIcon icon={faXmark} />
											</span>
										) : validDiscountCode === true ? (
											<span className='input-group-text bg-light bg-opacity-25 border-success text-success fenix'>{state !== undefined && typeof state !== "number" ? (state.isPercentage ? `${state.value * 100} %` : `${state.value} €`) : ""}</span>
										) : (
											<button className={`btn btn${discountCode === "" ? "-outline" : ""}-success`} type='submit' disabled={discountCode === ""}>
												<FontAwesomeIcon icon={faArrowRight} />
											</button>
										)}
									</div>
								</form>
								<hr />
								<div className='d-flex justify-content-between align-items-center'>
									<p className='fs-4 mb-0 lh-1'>Summe:</p>
									<p className='fs-3 mb-0 fenix lh-1'>{(discountedCartValue !== undefined ? discountedCartValue : cartValue).toFixed(2)} €</p>
								</div>
								<div className='text-muted d-flex justify-content-between align-items-center'>
									<p className='fs-6 mb-0 lh-1'>{discountedCartValue !== undefined && "Ohne Rabatt:"}&nbsp;</p>
									<p className='fs-5 mb-0 fenix lh-1'>&nbsp;{discountedCartValue !== undefined && cartValue.toFixed(2) + " €"}</p>
								</div>
								<hr />
								<form action={orderFormAction}>
									<input type='hidden' name='uuid' value={uuid} id='uuid' />
									<input type='hidden' name='discount' value={discountCode} id='discount' />
									<input type='hidden' name='cart' value={JSON.stringify(cart)} id='cart' />
									<input type='hidden' name='ticketNames' value={JSON.stringify(info.ticketNames)} id='ticketNames' />
									<input type='hidden' name='message' value={info.message} id='message' />
									<input type='hidden' name='email' value={info.email} id='email' />
									<input type='hidden' name='firstName' value={info.firstName} id='firstName' />
									<input type='hidden' name='lastName' value={info.lastName} id='lastName' />
									<button className='btn btn-success w-100' type='submit' disabled={cart === undefined || cart.length === 0 || (discountCode !== undefined && discountCode.length > 0 && validDiscountCode !== true)}>
										Jetzt bestellen
										<FontAwesomeIcon icon={faChevronRight} className='ms-2' />
									</button>
									<p className='text-danger'>{error.error}</p>
								</form>
							</BaseTile>
						</div>
					</div>
				</BaseTile>
			</div>
		</div>
	);
}
