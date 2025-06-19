import StatisticsTile from "@/components/tiles/data-visualisation/statistics-tile";
import { Color, formatDate, getCountdownString } from "@/components/utils";
import { StatisticsData, getStatsData } from "../data";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faClock, faTicket } from "@fortawesome/free-solid-svg-icons";
import ClientTime from "@/components/ClientTime";

export default async function Statistics() {
	const { session } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const stats: StatisticsData | null = await getStatsData(session.currentEventId);

	return (
		<>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Danger} title='Sales' subtitle={"Paid: " + (stats ? stats.payed_quantity : "---")} value={stats ? stats.complete_quantity.toString() : "---"}>
				<FontAwesomeIcon icon={faTicket} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Info} title='Revenue' subtitle={"Paid: " + (stats ? (stats.payed_sum ?? 0).toFixed(2) + "€" : "---")} value={stats ? (stats.complete_sum ?? 0).toFixed(2).toString() + "€" : "---"}>
				<FontAwesomeIcon icon={faCashRegister} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Warning} title='Countdown' subtitle={stats ? <ClientTime date={stats.start_date} /> : "---"} value={stats ? getCountdownString(stats.start_date) : "---"}>
				<FontAwesomeIcon icon={faClock} />
			</StatisticsTile>
		</>
	);
}
