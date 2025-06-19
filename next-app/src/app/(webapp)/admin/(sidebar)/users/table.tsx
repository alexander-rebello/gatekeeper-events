"use client";
import { createColumnHelper } from "@tanstack/react-table";
import DynamicTableTile, { TableTileOptions } from "@/components/tiles/data-visualisation/dynamic-table-tile";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { formatDate, getStatusColor, getStatusIcon } from "@/components/utils";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ClientTime from "@/components/ClientTime";

export type User = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	date_added: Date;
	role: string;
	image: string | null;
};

export default function UsersTable({ data, canEdit }: { data: User[]; canEdit: boolean }) {
	const options: TableTileOptions = {
		pageSize: false,
		searchBar: true,
		startDate: false,
		endDate: false,
		paginationFirst: false,
		paginationLast: false,
		paginationNext: false,
		paginationPrev: false,
		goToPage: false,
		pageIndex: false,
		showAllRows: true,
	};

	const columnHelper = createColumnHelper<User>();

	const columns = [
		columnHelper.accessor("image", {
			header: () => "Image",
			cell: (props) => <img src={props.getValue() ? "/public/users/" + props.getValue() : "/img/profile_default.png"} height='31' className='rounded-circle' />,
			sortingFn: "alphanumeric",
			filterFn: "includesString",
			meta: {
				stretch: false,
				center: true,
			},
		}),
		columnHelper.accessor("first_name", {
			header: () => "First Name",
			cell: (props) => props.getValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("last_name", {
			header: () => "Last Name",
			cell: (props) => props.getValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("email", {
			header: () => "E-Mail",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("role", {
			header: () => "Role",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("date_added", {
			header: () => "Date added",
			cell: (props) => <ClientTime date={props.getValue()} />,
			sortingFn: "datetime",
			filterFn: "includesString",
		}),
		...(canEdit
			? [
					columnHelper.display({
						id: "edit",
						header: "Edit",
						cell: (props) => (
							<OverlayTrigger overlay={<Tooltip>View/Edit</Tooltip>}>
								<Link className='link-primary bg-transparent border-0' href={`/admin/users/${props.row.original.id}`}>
									<FontAwesomeIcon icon={faPenToSquare} />
								</Link>
							</OverlayTrigger>
						),
						meta: {
							center: true,
							stretch: false,
						},
					}),
			  ]
			: []),
	];

	return <DynamicTableTile className='col-12' data={data} columns={columns} options={options} />;
}
