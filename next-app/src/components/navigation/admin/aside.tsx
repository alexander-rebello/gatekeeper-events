"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SidebarLink, { SidebarLinkT } from "./sidebar-link";
import Link from "next/link";
import { faChevronRight, faDungeon, faMasksTheater } from "@fortawesome/free-solid-svg-icons";

export type SidebarLink = {
	title: string;
	target: string;
	svgPath: string;
};

export default function Sidebar({ sidebarLinks, toggleFunction, isMobile, toggled }: { sidebarLinks: SidebarLinkT[]; toggleFunction: Function; isMobile: boolean; toggled: boolean }) {
	return (
		<aside className={`bg-dark-subtle shadow-lg d-flex flex-column flex-shrink-0 position-fixed top-0 bottom-0 p-3 left-0`}>
			<Link className='text-uppercase fs-5 text-decoration-none lh-1 text-g quantum d-flex mt-4 brand align-items-center' href='/'>
				<div className='hide-r ps-1'>
					<FontAwesomeIcon icon={faDungeon} className='fs-2 text-white' />
				</div>
				<div className='hide ps-1'>GateKeeper</div>
			</Link>
			<hr />
			<div className='nav flex-column flex-grow-1 mb-auto'>
				{sidebarLinks.map((link, i) => (
					<SidebarLink link={link} key={i} className={link.down ? "mt-auto" : ""} onClick={isMobile && toggled ? toggleFunction : () => {}} />
				))}
			</div>
			<hr />
			<button className='btn btn-primary d-flex justify-content-center align-items-center toggle-sidebar' id='sidebarToggle' type='button' onClick={() => toggleFunction()}>
				<FontAwesomeIcon icon={faChevronRight} className='fs-4' />
			</button>
		</aside>
	);
}
