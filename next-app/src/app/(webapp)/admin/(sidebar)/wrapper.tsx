"use client";
import { useEffect, useState } from "react";

import { SidebarLinkT } from "@/components/navigation/admin/sidebar-link";
import Sidebar from "@/components/navigation/admin/aside";
import { faArrowUpRightFromSquare, faGaugeHigh, faGears, faList, faMasksTheater, faQrcode, faTags, faTicket, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "@/components/useWindowDimensions";

export default function Wrapper({ children, currentEventToken, permissions }: { children: React.ReactNode; currentEventToken: string; permissions: string[] }) {
	// Toggle sidebar
	// mobile: switch between hidden/fullscreen
	// desktop: switch between small/normal width
	const [toggled, setToggled] = useState(false);
	const { width } = useWindowDimensions();

	const sidebarLinks: SidebarLinkT[] = [
		{
			title: "Dashboard",
			href: "/admin/overview",
			icon: faGaugeHigh,
		},
		{
			title: "Orders",
			href: "/admin/orders",
			icon: faList,
			permission: "viewOrders",
		},
		{
			title: "Tickets",
			href: "/admin/tickets",
			icon: faTicket,
			permission: "viewTicketTypes",
		},
		{
			title: "Discounts",
			href: "/admin/discounts",
			icon: faTags,
			permission: "viewDiscountCodes",
		},
		{
			title: "Settings",
			href: "/admin/settings",
			icon: faGears,
			permission: "viewSettings",
		},
		{
			title: "View live",
			href: "/event/" + currentEventToken,
			icon: faArrowUpRightFromSquare,
			target: "_blank",
		},
		{
			title: "Users",
			href: "/admin/users",
			icon: faUsersGear,
			permission: "viewUsers",
		},
		{
			title: "Switch Event",
			href: "/admin/events",
			icon: faMasksTheater,
			down: true,
		},
	];

	const permissionChecked = sidebarLinks.filter((link) => link.permission === undefined || permissions.includes(link.permission));

	/* 	{	
			title: "QR-Code App",
			href: "#",
			icon: faQrcode,
			disabled: true,
		}, */

	const toggleFunction = () => {
		setToggled(!toggled);
	};

	return (
		<div className={`sidebar ${toggled ? "sidebar-toggled" : ""} pt-5 d-flex flex-column min-vh-100`}>
			<Sidebar sidebarLinks={permissionChecked} toggleFunction={toggleFunction} isMobile={width !== null && width <= 992} toggled={toggled} />
			{children}
		</div>
	);
}
