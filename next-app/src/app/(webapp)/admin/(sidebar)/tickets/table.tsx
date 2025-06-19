"use client";
import { createColumnHelper } from "@tanstack/react-table";
import DynamicTableTile, { TableTileOptions } from "@/components/tiles/data-visualisation/dynamic-table-tile";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { getStatusColor, getStatusIcon } from "@/components/utils";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export type Ticket = {
	id: number;
	title: string;
	color: string;
	price: number;
	max_quantity: number;
	status: string;
	quantity: number;
};

export default function TicketsTable({ data, canEdit }: { data: Ticket[]; canEdit: boolean }) {
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

	const columnHelper = createColumnHelper<Ticket>();

	const columns = [
		columnHelper.accessor("title", {
			header: () => "Title",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("price", {
			header: () => "Price",
			cell: (props) => props.getValue().toFixed(2) + "€",
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("color", {
			header: () => "Color",
			cell: (props) => (
				<div className='d-flex align-items-center'>
					<div style={{ backgroundColor: props.getValue(), width: "1em", height: "1em", borderRadius: "50%" }} className='me-2'></div>
					{props.getValue()}
				</div>
			),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("max_quantity", {
			header: () => "Max. Orders",
			cell: (props) => (props.getValue() === 0 ? "Unlimited" : props.getValue()),
			sortingFn: "datetime",
			filterFn: "includesString",
		}),
		columnHelper.accessor("quantity", {
			header: () => "Times sold",
			cell: (props) => props.renderValue(),
			sortingFn: "basic",
			filterFn: "includesString",
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
		...(canEdit
			? [
					columnHelper.display({
						id: "edit",
						header: "Edit",
						cell: (props) => (
							<OverlayTrigger overlay={<Tooltip>View/Edit</Tooltip>}>
								<Link className='link-primary bg-transparent border-0' href={`/admin/tickets/${props.row.original.id}`}>
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
