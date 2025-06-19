import PageLayout from "@/components/navigation/admin/page-layout";
import Link from "next/link";

export default function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	return (
		<PageLayout
			title='Users'
			action={
				<Link href='/superadmin/users/new' className='btn btn-primary'>
					New User
				</Link>
			}
		>
			{modal}
			{children}
		</PageLayout>
	);
}
