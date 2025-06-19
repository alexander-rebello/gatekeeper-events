import StatisticsTile from "@/components/tiles/data-visualisation/statistics-tile";
import { Color } from "@/components/utils";
import { StatisticsData, getStatsData } from "../data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faMasksTheater, faTicket } from "@fortawesome/free-solid-svg-icons";

export default async function Statistics() {
	const stats: StatisticsData | null = await getStatsData();

	return (
		<>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Danger} title='Events' value={stats ? stats.events : "---"}>
				<FontAwesomeIcon icon={faMasksTheater} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Info} title='Orders' value={stats ? stats.orders : "---"}>
				<FontAwesomeIcon icon={faList} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Warning} title='Tickets' value={stats ? stats.tickets : "---"}>
				<FontAwesomeIcon icon={faTicket} />
			</StatisticsTile>
		</>
	);
}
