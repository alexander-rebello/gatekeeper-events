"use server";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default async function UserPageTile({ title, description, icon, className = "", children, valid = true }: { title: string; description?: string; icon?: IconProp; className?: string; children?: React.ReactNode; valid?: boolean }) {
	return (
		<div className={className}>
			<div className={`card bg-body-secondary border-${valid ? "dark" : "danger"} shadow-lg overflow-hidden`}>
				<div className="card-body p-4">
					<Link className="d-flex align-items-center mb-2 text-muted" href="/">
						<FontAwesomeIcon icon={faArrowLeft} className="me-2" />
						Go Home
					</Link>
					<div className="text-center">
						{icon && <FontAwesomeIcon className="mb-3" icon={icon} height={"2em"} />}
						<h2 className="fw-bold">{title}</h2>
						{description !== undefined ? <p>{description}</p> : null}
					</div>
					{children ? <div>{children}</div> : null}
				</div>
			</div>
		</div>
	);
}
