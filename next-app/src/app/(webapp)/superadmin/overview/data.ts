import { ChartData } from "@/components/tiles/data-visualisation/chart-tile";
import { ListData } from "@/components/tiles/data-visualisation/list-tile";
import prisma from "@/db/client";

export type StatisticsData = {
	events: number;
	orders: number;
	tickets: number;
};

export async function getStatsData(): Promise<StatisticsData | null> {
	const events = await prisma.event.count();
	const orders = await prisma.order.count();
	const tickets = await prisma.ticket.count();

	return {
		events,
		orders,
		tickets,
	};
}

type ChartItem = {
	day: Date;
	quantity: number;
};

function getMissingDates(startDate: Date, endDate: Date): ChartItem[] {
	const dates: ChartItem[] = [];
	let currentDate = new Date(startDate);

	while (currentDate < endDate) {
		currentDate.setDate(currentDate.getDate() + 1);

		dates.push({ day: new Date(currentDate), quantity: 0 });
	}

	dates.pop();

	return dates;
}

export async function getChartData(): Promise<ChartData> {
	const result = await prisma.sales.groupBy({
		by: ["day"],
		where: {
			day: {
				gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			},
		},
		_sum: {
			quantity: true,
		},
		orderBy: {
			day: "asc",
		},
		take: 30,
	});

	if (result.length === 0) return { labels: [], datasets: [] };

	const data: ChartItem[] = result.map((d) => ({
		day: d.day,
		quantity: d._sum.quantity ?? 0,
	}));

	const lowestDate = data[0].day;
	const highestDate = data[data.length - 1].day;

	const allDates = data.reduce((result: ChartItem[], dateObj) => {
		const currentDate = dateObj.day;

		if (currentDate > lowestDate) {
			const nextDate = result[result.length - 1].day ?? lowestDate;
			if (currentDate.getTime() - nextDate.getTime() > 24 * 60 * 60 * 1000) {
				const missingDates = getMissingDates(nextDate, currentDate);
				result.push(...missingDates);
			}
		}

		result.push(dateObj);
		return result;
	}, []);

	const chartLabels = allDates.map((d) =>
		new Intl.DateTimeFormat("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: undefined,
		}).format(d.day)
	);

	const color = "52, 152, 219";

	return {
		labels: chartLabels,
		datasets: [
			{
				label: "Sales",
				data: allDates.map((d) => d.quantity),
				borderColor: `rgba(${color}, 1)`,
				backgroundColor: `rgba(${color}, 0.5)`,
				fill: true,
			},
		],
	};
}

export async function getListData(): Promise<ListData> {
	const result = await prisma.user.findMany({
		orderBy: {
			created_at: "desc",
		},
		take: 15,
		select: {
			uuid: true,
			first_name: true,
			last_name: true,
			created_at: true,
			status: {
				select: {
					value: true,
				},
			},
		},
	});

	const listData: ListData = result.map((d) => ({
		title: d.first_name + " " + d.last_name,
		href: "/superadmin/users/" + d.uuid,
		subtitle: d.created_at.toLocaleDateString("de-DE", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
	}));

	return listData;
}
