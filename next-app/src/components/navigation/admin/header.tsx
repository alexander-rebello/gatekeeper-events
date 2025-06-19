"use client";
import logoutAction from "@/auth/actions/logout-action";
import { usePathname } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";

export default function Header({ name }: { name: string }) {
	const pathname = usePathname();

	return (
		<header id='header' className='fixed-top p-4 pb-0'>
			<Navbar collapseOnSelect expand='sm' className='bg-body-secondary shadow-lg rounded-3 py-2 blur'>
				<div className='container'>
					<Navbar.Text className='text-light'>Welcome, {name}!</Navbar.Text>
					<Navbar.Toggle aria-controls='responsive-navbar-nav' />
					<Navbar.Collapse id='responsive-navbar-nav'>
						<Nav className='ms-auto'>
							<Nav.Link className={"link-light text-center me-3" + (pathname == "/admin/events" ? " text-decoration-underline" : "")} href='/admin/events'>
								Events
							</Nav.Link>
							<Nav.Link className={"link-light text-center me-3" + (pathname == "/profile" ? " text-decoration-underline" : "")} href='/profile'>
								Settings
							</Nav.Link>
							<Nav.Item className='link-light'>
								<form action={logoutAction}>
									<button className='nav-link link-light text-center w-100' type='submit'>
										Log out
									</button>
								</form>
							</Nav.Item>
						</Nav>
					</Navbar.Collapse>
				</div>
			</Navbar>
		</header>
	);
}
