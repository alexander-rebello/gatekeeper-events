"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
	return null;
	useReportWebVitals((metric) => {
		console.log(metric);
	});
	return null;
}
