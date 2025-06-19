import { ChartData } from "@/components/tiles/data-visualisation/chart-tile";
import { ListData } from "@/components/tiles/data-visualisation/list-tile";
import { Color, getStatusColor } from "@/components/utils";
import prisma from "@/db/client";
import { Decimal } from "@prisma/client/runtime/library";

export type StatisticsData = {
	start_date: Date;
	complete_quantity: number;
	complete_sum: Decimal | null;
	payed_quantity: number;
	payed_sum: Decimal | null;
};

export async function getStatsData(eventId: number): Promise<StatisticsData | null> {
	const data = await prisma.statistics.findUnique({
		where: {
			event_id: eventId,
		},
		select: {
			start_date: true,
			complete_quantity: true,
			complete_sum: true,
			payed_quantity: true,
			payed_sum: true,
		},
	});

	if (!data) {console.error("Could not find statistics data for event " + eventId + "\nThis should never happen!");return null;}

	return {
		start_date: data.start_date,
		complete_quantity: data.complete_quantity,
		complete_sum: data.complete_sum ?? new Decimal(0),
		payed_quantity: data.payed_quantity,
		payed_sum: data.payed_sum ?? new Decimal(0),
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

	return dates;
}

export async function getChartData(eventId: number): Promise<ChartData> {
	const event = await prisma.event.findUnique({
		where: {
			id: eventId,
		},
		select: {
			start_date: true,
			sale_end_date: true,
		},
	});

	if (!event) return { labels: [], datasets: [] };

	// if sale end date is set, use it, otherwise use start date
	// if both are in the future, use current date
	const topEnd = new Date(Math.min((event.sale_end_date ?? event.start_date).getTime(), Date.now()));


	const rawData = await prisma.sales.findMany({
		where: {
			event_id: eventId,
			day: {
				gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
				lt: topEnd,
			},
		},
		select: {
			day: true,
			quantity: true,
		},
		orderBy: {
			day: "asc",
		},
		take: 30,
	});

	const data: ChartItem[] = rawData.map((item) => ({
		day: item.day,
		quantity: Number(item.quantity),
	}));

	if (data.length === 0) return { labels: [], datasets: [] };

	const lowestDate = data[0].day;
	const highestDate = data[data.length - 1].day;

	const allDates = data.reduce((result: ChartItem[], dateObj) => {
		const currentDate = dateObj.day;

		if (currentDate > lowestDate && currentDate < highestDate) {
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

export async function getListData(eventId: number): Promise<ListData> {
	const result = await prisma.order.findMany({
		where: {
			event_id: eventId,
		},
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
			_count: {
				select: {
					tickets: true,
				},
			},
		},
	});

	const listData: ListData = result.map((d) => ({
		title: d.first_name + " " + d.last_name,
		href: "/admin/orders/" + d.uuid,
		subtitle: d.created_at.toLocaleDateString("de-DE", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
		primaryBadge: {
			value: d._count.tickets + " Ticket" + (d._count.tickets > 1 ? "s" : ""),
			color: Color.Info,
		},
		secondaryBadge: {
			value: d.status.value,
			color: getStatusColor(d.status.value),
		},
	}));

	return listData;
}
