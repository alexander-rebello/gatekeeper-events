import StatisticsTile from "@/components/tiles/data-visualisation/statistics-tile";
import { Color } from "@/components/utils";
import { faTicket, faCashRegister, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function Loading() {
	const loading: React.ReactNode = <span className='placeholder w-50' style={{ height: "1em" }}></span>;

	return (
		<>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Danger} title='Sales' value={loading} subtitle={loading}>
				<FontAwesomeIcon icon={faTicket} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Info} title='Revenue' value={loading} subtitle={loading}>
				<FontAwesomeIcon icon={faCashRegister} />
			</StatisticsTile>
			<StatisticsTile className='col-12 col-md-6 col-lg-4' color={Color.Warning} title='Countdown' value={loading} subtitle={loading}>
				<FontAwesomeIcon icon={faClock} />
			</StatisticsTile>
		</>
	);
}
