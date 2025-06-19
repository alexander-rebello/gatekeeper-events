"use client";
import { useEffect } from "react";
import { localData } from "../../../utils";

export default function Purger({ eventUUid }: { eventUUid: string }) {
	useEffect(() => {
		localData.remove("data-" + eventUUid);
		localData.remove("cart-" + eventUUid);
	}, []);
	return null;
}
