import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function LabelAddition({ required = true, text = "" }: { required?: boolean; text?: string }) {
	const tooltip = <Tooltip className='form-tooltip lh-1'>{text}</Tooltip>;

	return (
		<>
			{required ? <span className='text-danger'>*</span> : null}
			{text ? (
				<OverlayTrigger overlay={tooltip}>
					<FontAwesomeIcon icon={faCircleQuestion} className='ms-2 text-body' style={{ cursor: "help" }} />
				</OverlayTrigger>
			) : null}
		</>
	);
}
