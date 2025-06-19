"use client";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, ChartData as ChartJSData, Point, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import BaseTile from "../base-tile";

export type ChartData = ChartJSData<"line", (number | Point | null)[], unknown>;

export default function ChartTile({ className = "", title = "", data }: { className?: string; title?: string; data: ChartData }) {
	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
	};

	return (
		<BaseTile className={className} title={title}>
			<Line options={options} data={data} />
		</BaseTile>
	);
}
