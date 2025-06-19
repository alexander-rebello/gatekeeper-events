"use client";
import { createColumnHelper } from "@tanstack/react-table";
import DynamicTableTile, { TableTileOptions, dateRangeF } from "@/components/tiles/data-visualisation/dynamic-table-tile";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { formatDate, getStatusColor, getStatusIcon } from "@/components/utils";
import Link from "next/link";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ClientTime from "@/components/ClientTime";

export type DiscountCode = {
	id: number;
	code: string;
	value: string;
	isPercentage: boolean;
	createdAt: Date;
	status: string;
	orders: number;
};

export default function DiscountCodesTable({ data, canEdit }: { data: DiscountCode[]; canEdit: boolean }) {
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

	const columnHelper = createColumnHelper<DiscountCode>();

	const columns = [
		columnHelper.accessor("code", {
			header: () => "Code",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("value", {
			header: () => "Value",
			cell: (props) => props.renderValue(),
			sortingFn: "alphanumeric",
			filterFn: "includesString",
		}),
		columnHelper.accessor("isPercentage", {
			header: () => "Type",
			cell: (props) => (props.getValue() ? "%" : "€"),
			sortingFn: "basic",
			filterFn: "includesString",
		}),
		columnHelper.accessor("orders", {
			header: () => "Times used",
			cell: (props) => props.renderValue(),
			sortingFn: "basic",
			filterFn: "includesString",
		}),
		columnHelper.accessor("createdAt", {
			header: () => "Date",
			cell: (props) => <ClientTime date={props.getValue()} />,
			sortingFn: "datetime",
			filterFn: dateRangeF,
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
								<Link className='link-primary bg-transparent border-0' href={`/admin/discounts/${props.row.original.code}`}>
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
