import { faDungeon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loading() {
	return (
		<div className="w-100 vh-100 d-flex justify-content-center align-items-center">
			<FontAwesomeIcon icon={faDungeon} size="xl" className="text-white" />
		</div>
	);
}
