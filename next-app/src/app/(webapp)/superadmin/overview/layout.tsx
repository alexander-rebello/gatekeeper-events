import PageLayout from "@/components/navigation/admin/page-layout";

export default async function Layout({ children, statistics, chart, list }: { children: React.ReactNode; statistics: React.ReactNode; chart: React.ReactNode; list: React.ReactNode }) {
	return (
		<PageLayout title='Dashboard'>
			{statistics}
			{chart}
			{list}
			{children}
		</PageLayout>
	);
}
