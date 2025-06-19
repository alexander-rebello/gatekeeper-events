import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProgressBar from "react-bootstrap/ProgressBar";

export type Requirement = {
	title: string;
	fullfilled: boolean;
	part: number;
};

export default function RequirementsField({ className, title = "Requirements", requirements }: { className?: string; title?: string; requirements: Requirement[] }) {
	const max: number = requirements.reduce((n, { part }) => n + part, 0);
	const start: number = max * 0.1;
	const value: number = requirements.reduce((n, { fullfilled, part }) => (fullfilled ? n + part : n), 0);
	const variant: string = value == 0 ? "danger" : value == max ? "success" : "warning";

	return (
		<div className={className}>
			<label className="form-label">{title}</label>
			<ProgressBar now={value + start} min={0} max={max + start} variant={variant} className={"border border-" + variant} />
			<div className="mt-3">
				<ul className="list-unstyled ps-2">
					{requirements.map((requirement, i) => (
						<li key={i} className="d-flex align-items-center">
							{requirement.fullfilled ? <FontAwesomeIcon icon={faCheck} className="text-success me-2" /> : <FontAwesomeIcon icon={faX} className="text-danger me-2" />}
							<span>{requirement.title}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
