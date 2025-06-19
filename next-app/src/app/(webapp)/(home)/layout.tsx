import Header from "@/components/navigation/home/header";
import Footer from "@/components/navigation/home/footer";
import { validateRequest } from "@/auth/lucia";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const { user } = await validateRequest(true);

	return (
		<>
			<Header loggedIn={user !== null} />
			<main className='overflow-hidden'>{children}</main>
			<Footer />
		</>
	);
}
