import StatisticsTile from "@/components/tiles/data-visualisation/statistics-tile";
import { Color } from "@/components/utils";
import { faTicket, faList, faMasksTheater } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function Loading() {
	const loading: React.ReactNode = <span className='placeholder w-50' style={{ height: "1em" }}></span>;

	return (
		<>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Danger} title='Events' value={loading}>
				<FontAwesomeIcon icon={faMasksTheater} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Info} title='Orders' value={loading}>
				<FontAwesomeIcon icon={faList} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Warning} title='Tickets' value={loading}>
				<FontAwesomeIcon icon={faTicket} />
			</StatisticsTile>
		</>
	);
}
