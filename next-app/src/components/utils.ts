import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faX, faBan, faHourglass, faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";

export enum Color {
	Primary = "primary",
	Secondary = "secondary",
	Success = "success",
	Danger = "danger",
	Warning = "warning",
	Info = "info",
}

export type NonEmptyArray<T> = [T, ...T[]];

const dateFormat = new Intl.DateTimeFormat("de-DE", {
	dateStyle: "short",
	timeStyle: "short",
	timeZone: "UTC",
});

export const formatDate = (date: Date, adjustTimezone: boolean = true): string => {
	const adjustedDate = adjustTimezone ? utcToLocaleDate(date) : date;
	return dateFormat.format(adjustedDate.getTime());
};

export const utcToLocaleDate = (date: Date): Date => {
	return new Date(date.getTime() + new Date().getTimezoneOffset() * -60000);
};

export const localeToUtcDate = (date: string): string => {
	return new Date(date).toISOString();
};

export const utcToInputValue = (date: Date, adjustTimezone: boolean = true): string => {
	const adjustedDate = adjustTimezone ? utcToLocaleDate(date) : date;
	return adjustedDate.toISOString().slice(0, 16);
};

export const HEX_REGEX: RegExp = /^#([0-9A-F]{3}){1,2}$/i;

export function getCountdownString(startDate: Date): string {
	const now = new Date();

	if (startDate.getTime() < now.getTime()) return "Started";

	const timeDiff = startDate.getTime() - now.getTime();
	const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
	const monthsDiff = Math.floor(daysDiff / 30);

	if (monthsDiff > 1) {
		return `${monthsDiff} M ${daysDiff % 30} d`;
	} else {
		const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
		return `${daysDiff} d ${hoursDiff % 24} h`;
	}
}

export function getStatusColor(status: string): Color {
	switch (status) {
		case "COMPLETED":
		case "ACTIVE":
		case "PUBLIC":
			return Color.Success;
		case "HIDDEN":
		case "PENDING":
			return Color.Warning;
		case "CANCELLED":
		case "DEACTIVATED":
		case "DISABLED":
		case "REFUNDED":
			return Color.Danger;
		default:
			return Color.Info;
	}
}

export function getStatusIcon(orderStatus: string): IconProp {
	switch (orderStatus) {
		case "ACTIVE":
		case "COMPLETED":
			return faCheck;
		case "DISABLED":
		case "REFUNDED":
			return faX;
		case "PUBLIC":
			return faEye;
		case "HIDDEN":
			return faEyeSlash;
		case "PENDING":
			return faHourglass;
		case "CANCELLED":
		case "DEACTIVATED":
		default:
			return faBan;
	}
}

export function isAlphaNumeric(str: string) {
	var code, i, len;

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (
			!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123)
		) {
			// lower alpha (a-z)
			return false;
		}
	}
	return true;
}
