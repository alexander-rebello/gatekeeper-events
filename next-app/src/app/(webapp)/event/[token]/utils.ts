import { z } from "zod";
import { CartItem } from "./(shop)/tickets/content";

export const localData = {
	set(key: string, value: string) {
		localStorage.setItem(key, JSON.stringify(value));
	},
	get(key: string) {
		const stored = localStorage.getItem(key);
		return stored == null ? undefined : JSON.parse(stored);
	},
	remove(key: string) {
		localStorage.removeItem(key);
	},
};

export function getCartData(uuid: string) {
	let newCart = [];

	const jsonData = localData.get("cart-" + uuid);
	if (jsonData) {
		const data = JSON.parse(jsonData);

		if (data && data.cart && z.array(z.object({ id: z.number(), amount: z.number().positive() })).safeParse(data.cart).success) {
			newCart = data.cart;
		}
	}

	return { cart: newCart };
}

export function setCartData(uuid: string, cart: { id: number; amount: number }[]) {
	localData.set(
		"cart-" + uuid,
		JSON.stringify({
			cart: cart.length > 0 ? cart : undefined,
		})
	);
}

export function getInfoData(uuid: string) {
	const cartData = getCartData(uuid);

	let newFirstName = "";
	let newLastName = "";
	let newEmail = "";
	let newMessage = "";
	let newTicketNames: { id: number; names: string[] }[] = cartData.cart.map((ticket: CartItem) => ({
		id: ticket.id,
		names: new Array(ticket.amount).fill(""),
	}));

	const dataJson = localData.get("data-" + uuid);
	if (dataJson) {
		const dataData = JSON.parse(dataJson);
		if (dataData) {
			if (dataData.firstName && z.string().safeParse(dataData.firstName).success) {
				newFirstName = dataData.firstName;
			}
			if (dataData.lastName && z.string().safeParse(dataData.lastName).success) {
				newLastName = dataData.lastName;
			}
			if (dataData.email && z.string().safeParse(dataData.email).success) {
				newEmail = dataData.email;
			}
			if (dataData.message && z.string().safeParse(dataData.message).success) {
				newMessage = dataData.message;
			}
			if (dataData.ticketNames && z.array(z.object({ id: z.number(), names: z.array(z.string()) })).safeParse(dataData.ticketNames).success) {
				newTicketNames = cartData.cart.map((ticket: CartItem) => {
					let nameList = dataData.ticketNames.find((value: { id: number; names: string[] }) => value.id === ticket.id)?.names || [];
					if (ticket.amount > nameList.length) nameList = nameList.concat(new Array(ticket.amount - nameList.length).fill(""));
					else if (ticket.amount < nameList.length) nameList = nameList.slice(0, ticket.amount);
					return {
						id: ticket.id,
						names: nameList,
					};
				});
			}
		}
	}

	return {
		firstName: newFirstName,
		lastName: newLastName,
		email: newEmail,
		message: newMessage,
		ticketNames: newTicketNames,
		cartData: cartData,
	};
}
