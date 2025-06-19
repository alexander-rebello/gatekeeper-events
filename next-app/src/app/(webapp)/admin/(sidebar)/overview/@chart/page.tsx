import ChartTile, { ChartData } from "@/components/tiles/data-visualisation/chart-tile";
import { getChartData } from "../data";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function Chart() {
	const { session } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const chartData: ChartData = await getChartData(session.currentEventId);

	return <ChartTile title='Daily Sales' className='col-12 col-lg-8' data={chartData} />;
}
