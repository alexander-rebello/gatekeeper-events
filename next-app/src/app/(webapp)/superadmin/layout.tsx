import Header from "@/components/navigation/admin/header";
import Footer from "@/components/navigation/admin/footer";
import Wrapper from "./wrapper";
import { AllowedPrivaleges, checkPrivaleges, checkSuperAdmin } from "@/auth/lucia";
import { redirect } from "next/navigation";
import prisma from "@/db/client";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const { user } = await checkSuperAdmin(true);

	return (
		<Wrapper>
			<Header name={user.firstName} />
			<main id='main' className='py-5 overflow-hidden flex-grow-1'>
				{children}
			</main>
			<Footer />
		</Wrapper>
	);
}
