"use client";
import { createColumnHelper } from "@tanstack/react-table";
import DynamicTableTile, { TableTileOptions, dateRangeF } from "@/components/tiles/data-visualisation/dynamic-table-tile";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { formatDate, getStatusColor, getStatusIcon } from "@/components/utils";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPenToSquare, faTimes } from "@fortawesome/free-solid-svg-icons";
import ClientTime from "@/components/ClientTime";

export type User = {
	uuid: string;
	name: string;
	email: string;
	email_verified: boolean;
	status: string;
	events: number;
	created_at: Date;
};

export default function UserTable({ data }: { data: User[] }) {
	const options: TableTileOptions = {
		pageSize: true,
		searchBar: true,
		startDate: true,
		endDate: true,
		paginationFirst: true,
		paginationLast: true,
		paginationNext: true,
		paginationPrev: true,
		goToPage: true,
		pageIndex: true,
	};

	const columnHelper = createColumnHelper<User>();

	const columns = [
		columnHelper.accessor("name", {
			header: () => "Name",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("email", {
			header: () => "E-Mail",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("created_at", {
			header: () => "Date",
			cell: (props) => <ClientTime date={props.getValue()} />,
			sortingFn: "datetime",
			filterFn: dateRangeF,
		}),
		columnHelper.accessor("events", {
			header: "Events",
			cell: (props) => props.renderValue(),
			sortingFn: "basic",
			filterFn: "includesString",
			meta: {
				center: true,
				stretch: false,
			},
		}),
		columnHelper.accessor("email_verified", {
			header: "Verified",
			cell: (props) => <FontAwesomeIcon icon={props.getValue() ? faCheck : faTimes} className={"text-" + (props.getValue() ? "success" : "danger")} />,
			sortingFn: "basic",
			filterFn: "includesString",
			meta: {
				center: true,
				stretch: false,
			},
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (props) => (
				<OverlayTrigger overlay={<Tooltip>{props.getValue()}</Tooltip>}>
					<FontAwesomeIcon icon={getStatusIcon(props.getValue())} className={"text-" + getStatusColor(props.getValue())} />
				</OverlayTrigger>
			),
			sortingFn: "basic",
			filterFn: "includesString",
			meta: {
				center: true,
				stretch: false,
			},
		}),
		columnHelper.display({
			id: "edit",
			header: "Edit",
			cell: (props) => (
				<OverlayTrigger overlay={<Tooltip>View/Edit</Tooltip>}>
					<Link className='link-primary bg-transparent border-0' href={`/superadmin/users/${props.row.original.uuid}`}>
						<FontAwesomeIcon icon={faPenToSquare} />
					</Link>
				</OverlayTrigger>
			),
			meta: {
				center: true,
				stretch: false,
			},
		}),
	];

	return <DynamicTableTile className='col-12' data={data} columns={columns} options={options} />;
}
