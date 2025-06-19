import ChartTile, { ChartData } from "@/components/tiles/data-visualisation/chart-tile";
import { getChartData } from "../data";
import { checkSuperAdmin, validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function Chart() {
	const chartData: ChartData = await getChartData();

	return <ChartTile title='Daily Orders' className='col-12 col-lg-8' data={chartData} />;
}
