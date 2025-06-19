import BaseTile from "../base-tile";
import { Color } from "../../utils";
import Link from "next/link";

export type ListData = ListEntry[];

export type ListEntry = {
	title: string;
	href: string;
	subtitle: string;
	primaryBadge?: BadgeData;
	secondaryBadge?: BadgeData;
};

export type BadgeData = {
	value: string;
	color: Color;
};

export default function ListTile({ className = "", title = "", data }: { className?: string; title?: string; data: ListEntry[] }) {
	return (
		<BaseTile className={className} title={title}>
			<div className='d-flex flex-column h-100'>
				{data.length == 0 ? <p className='fs-5 text-muted mb-0 text-center'>No data to display</p> : null}
				<ul className='list-group flex-grow-1 flex-shrink-1 scrollable-list scrollable-stats'>
					{data.map((entry, i) => (
						<Link key={i} href={{ pathname: entry.href }} className='list-group-item list-group-item-action list-group-item-light d-flex justify-content-between align-items-center'>
							<div className='d-flex flex-column'>
								<span>{entry.title}</span>
								<span className='text-muted'>{entry.subtitle}</span>
							</div>
							<div className='d-flex flex-column align-items-end'>
								{entry.primaryBadge && <span className={`badge rounded-pill bg-${entry.primaryBadge.color} mb-1`}>{entry.primaryBadge.value}</span>}
								{entry.secondaryBadge && <span className={`badge rounded-pill bg-${entry.secondaryBadge.color}`}>{entry.secondaryBadge.value}</span>}
							</div>
						</Link>
					))}
				</ul>
			</div>
		</BaseTile>
	);
}
