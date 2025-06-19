import Header from "@/components/navigation/admin/header";
import Footer from "@/components/navigation/admin/footer";
import { AllowedPrivaleges, checkPrivaleges } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const { user } = await checkPrivaleges(AllowedPrivaleges.USER, true);

	if (!user) redirect("/login");

	return (
		<div className='pt-5 d-flex flex-column min-vh-100'>
			<Header name={user.firstName} />
			<main id='main' className='py-5 overflow-hidden flex-grow-1'>
				{children}
			</main>
			<Footer />
		</div>
	);
}
