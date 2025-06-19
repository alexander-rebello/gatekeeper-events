"use client";
import { faDungeon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";

export default function Header({ loggedIn }: { loggedIn: boolean }) {
	return (
		<header className='bg-dark bg-opacity-50 shadow-lg fixed-top pt-2 blur'>
			<Navbar expand='md' className='py-2' data-bs-theme='dark'>
				<Container>
					<Navbar.Brand className='d-flex align-items-center py-0' href='/'>
						<FontAwesomeIcon icon={faDungeon} className='fs-2 text-white mb-2' />
						<span className='text-uppercase fs-3 ms-3 lh-1 text-g quantum'>GateKeeper</span>
					</Navbar.Brand>
					<Navbar.Toggle aria-controls='navbar' />
					<Navbar.Collapse id='navbar'>
						<Nav className='ms-md-auto text-center'>
							<Nav.Link href='/#pricing'>Pricing</Nav.Link>
							<Nav.Link href='/#contact'>Contact</Nav.Link>
						</Nav>
						<div className='d-flex justify-content-center'>
							{loggedIn === false ? (
								<>
									<Link className='ms-md-2 btn btn-light' href='/login'>
										Anmelden
									</Link>
									<Link className='ms-md-2 btn btn-primary' href='/signup'>
										Registrieren
									</Link>
								</>
							) : (
								<Link className='ms-md-2 btn btn-primary' href='/admin/overview'>
									Admin Panel
								</Link>
							)}
						</div>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</header>
	);
}
