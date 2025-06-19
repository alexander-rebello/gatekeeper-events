"use client";
import { useEffect, useState } from "react";

import { SidebarLinkT } from "@/components/navigation/admin/sidebar-link";
import Sidebar from "@/components/navigation/admin/aside";
import { faArrowUpRightFromSquare, faGaugeHigh, faGears, faList, faMasksTheater, faQrcode, faTags, faTicket, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "@/components/useWindowDimensions";

export default function Wrapper({ children }: { children: React.ReactNode }) {
	// Toggle sidebar
	// mobile: switch between hidden/fullscreen
	// desktop: switch between small/normal width
	const [toggled, setToggled] = useState(false);
	const { width } = useWindowDimensions();

	const sidebarLinks: SidebarLinkT[] = [
		{
			title: "Dashboard",
			href: "/superadmin/overview",
			icon: faGaugeHigh,
		},
		{
			title: "Users",
			href: "/superadmin/users",
			icon: faUsersGear,
		},
		{
			title: "Events",
			href: "/superadmin/events",
			icon: faMasksTheater,
		},
		{
			title: "Orders",
			href: "/superadmin/orders",
			icon: faList,
		},
		{
			title: "Settings",
			href: "/superadmin/settings",
			icon: faGears,
		},
	];

	const toggleFunction = () => {
		setToggled(!toggled);
	};

	return (
		<div className={`sidebar ${toggled ? "sidebar-toggled" : ""} pt-5 d-flex flex-column min-vh-100`}>
			<Sidebar sidebarLinks={sidebarLinks} toggleFunction={toggleFunction} isMobile={width !== null && width <= 992} toggled={toggled} />
			{children}
		</div>
	);
}
