"use client";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export type SidebarLinkT = {
	title: string;
	href: string;
	icon: IconProp;
	target?: "_self" | "_blank" | "_parent" | "_top";
	disabled?: boolean;
	down?: boolean;
	permission?: string;
};

export default function SidebarLink({ className = "", link, onClick = () => {} }: { className?: string; link: SidebarLinkT; onClick?: Function }) {
	const pathname = usePathname();
	return (
		<Link href={link.href} className={`btn bg-light mb-2 d-flex align-items-center justify-content-start fs-5 text-start w-100 ${className} ${pathname == link.href ? "active" : ""} ${link.disabled ? "disabled" : ""}`} onClick={() => onClick()} target={link.target || "_self"}>
			<FontAwesomeIcon icon={link.icon} />
			<div className='hide d-flex'>
				<span className='ms-3 fs-6'>{link.title}</span>
			</div>
		</Link>
	);
}
