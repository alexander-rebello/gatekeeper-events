"use client";

import { useEffect, useState } from "react";
import { formatDate } from "./utils";

export default function ClientTime({ date }: { date: Date }) {
	const [formattedDate, setFormattedDate] = useState("");

	useEffect(() => setFormattedDate(formatDate(date, true)), []);

	return <>{formattedDate}</>;
}
