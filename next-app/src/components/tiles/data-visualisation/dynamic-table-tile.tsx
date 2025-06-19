"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import BaseTile from "../base-tile";
import { ColumnFiltersState, ColumnMeta, Row, RowData, SortingState, PaginationState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownShortWide, faArrowUpWideShort, faChevronLeft, faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		center?: boolean;
		stretch?: boolean;
		padding?: boolean;
	}
}

export type DateRange = {
	startDate?: Date;
	endDate?: Date;
};

export type TableTileOptions = {
	pageSize?: boolean;
	searchBar?: boolean;
	startDate?: boolean;
	endDate?: boolean;
	paginationFirst?: boolean;
	paginationLast?: boolean;
	paginationNext?: boolean;
	paginationPrev?: boolean;
	goToPage?: boolean;
	pageIndex?: boolean;
	showAllRows?: boolean;
};

export function dateRangeF(row: Row<unknown>, columnId: string, filterValue: DateRange): boolean {
	if (filterValue.startDate || filterValue.endDate) {
		const cellDate = new Date(row.getValue(columnId));

		if (filterValue.startDate && filterValue.endDate) {
			return cellDate >= filterValue.startDate && cellDate <= filterValue.endDate;
		} else if (filterValue.startDate) {
			return cellDate >= filterValue.startDate;
		} else if (filterValue.endDate) {
			return cellDate <= filterValue.endDate;
		}
	}
	return true;
}

const defaultPageSize: number = 10;

export default function DynamicTableTile({ className = "", title, data, columns, options }: { className?: string; title?: string; data: unknown[]; columns: any; options?: TableTileOptions }) {
	const router = useRouter();
	const pathname = usePathname();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useQueryState<string>("search", parseAsString);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useQueryStates({ pageIndex: parseAsInteger, pageSize: parseAsInteger });
	const [pseudoPagination, setPseudoPagination] = useState({ pageIndex: 0, pageSize: defaultPageSize });

	const tableOptions: TableTileOptions = useMemo(
		() => ({
			pageSize: false,
			searchBar: false,
			startDate: false,
			endDate: false,
			paginationFirst: false,
			paginationLast: false,
			paginationNext: false,
			paginationPrev: false,
			goToPage: false,
			pageIndex: false,
			showAllRows: false,
			...(options == undefined ? {} : options),
		}),
		[options]
	);

	useEffect(() => {
		setPagination({
			pageIndex: pseudoPagination.pageIndex === 0 ? null : pseudoPagination.pageIndex,
			pageSize: pseudoPagination.pageSize === defaultPageSize ? null : pseudoPagination.pageSize,
		});
	}, [pseudoPagination]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
			columnFilters,
			pagination: tableOptions.showAllRows ? { pageIndex: 0, pageSize: data.length } : { pageIndex: pagination.pageIndex ?? 0, pageSize: pagination.pageSize ?? defaultPageSize },
		},
		globalFilterFn: "includesString",
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: setSorting,
		onPaginationChange: setPseudoPagination,
	});

	const handleDateRangeChange = (start: boolean, e: React.FormEvent<HTMLInputElement>) => {
		let dateValue = e.currentTarget.valueAsDate == null ? undefined : e.currentTarget.valueAsDate;

		setColumnFilters((prev) => {
			const date = prev.find((filter) => filter.id === "date");
			if (!date || !date.value) return prev.concat({ id: "date", value: start ? { startDate: dateValue } : { endDate: dateValue } });

			let startDateValue = (date.value as DateRange).startDate;

			let endDateValue = (date.value as DateRange).endDate;

			if (start) startDateValue = endDateValue && dateValue && dateValue > endDateValue ? endDateValue : dateValue;
			else endDateValue = startDateValue && dateValue && dateValue < startDateValue ? startDateValue : dateValue;

			return prev.map((filter) => (filter.id === "date" ? { ...filter, value: { startDate: startDateValue, endDate: endDateValue } } : filter));
		});
	};

	let { startDateString, endDateString } = useMemo((): { startDateString: string; endDateString: string } => {
		const date = columnFilters.find((filter) => filter.id === "date");
		let tmpStartDateString = "",
			tmpEndDateString = "";

		if (date && date.value) {
			const tmpStartDate = (date.value as DateRange).startDate;
			const tmpEndDate = (date.value as DateRange).endDate;
			if (tmpStartDate) tmpStartDateString = tmpStartDate.toISOString().substring(0, 10);
			if (tmpEndDate) tmpEndDateString = tmpEndDate.toISOString().substring(0, 10);
		}
		return { startDateString: tmpStartDateString, endDateString: tmpEndDateString };
	}, [columnFilters]);

	const allHeads = tableOptions.pageSize && tableOptions.startDate && tableOptions.endDate && tableOptions.searchBar;

	return (
		<BaseTile className={className} title={title} style={{ minHeight: "300px" }}>
			<div className={"row gy-3 justify-content-center mb-3 justify-content-xxl-" + (allHeads ? "between" : "around")}>
				{tableOptions.pageSize ? (
					<div className='col-12 col-sm-4 col-md-3 col-xxl-2 d-flex'>
						<select
							className='bg-light bg-opacity-10 flex-grow-1 border-light form-select shadow-sm text-light'
							value={pagination.pageSize ?? defaultPageSize}
							onChange={(e) => {
								table.setPageSize(Number(e.target.value));
							}}
						>
							{[defaultPageSize, 25, 50, 100].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									Show {pageSize}
								</option>
							))}
						</select>
					</div>
				) : null}
				{tableOptions.startDate || tableOptions.endDate ? (
					<div className='col-12 col-md-6 col-lg-5 d-flex justify-content-end order-sm-last'>
						<div className='input-group rounded shadow-sm'>
							{tableOptions.startDate ? <input className='bg-light bg-opacity-10 form-control border-light text-light' name='datestart' type='date' onChange={(e) => handleDateRangeChange(true, e)} value={startDateString} /> : null}
							{tableOptions.endDate ? <input className='bg-light bg-opacity-10 form-control border-light text-light' name='dateend' type='date' onChange={(e) => handleDateRangeChange(false, e)} value={endDateString} /> : null}
						</div>
					</div>
				) : null}
				{tableOptions.searchBar ? (
					<div className='col-12 col-sm-8 col-md-6 col-lg-4 d-flex justify-content-end order-lg-last'>
						<div className='input-group rounded shadow-sm'>
							<input className='bg-light bg-opacity-10 form-control border-light ps-3 text-light' type='search' name='search' placeholder='Search' autoComplete='off' onChange={(e) => setGlobalFilter(e.target.value === "" ? null : e.target.value)} value={globalFilter || ""} />
							<button className='btn btn-outline-light bg-light bg-opacity-10' onClick={() => setGlobalFilter(null)} type='button'>
								<FontAwesomeIcon icon={faXmark} />
							</button>
						</div>
					</div>
				) : null}
			</div>
			<div className='position-relative shadow-lg'>
				<div className='table-responsive'>
					<table className='table table-striped table-bordered table-big'>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										let classes: string = "";
										let meta: ColumnMeta<unknown, unknown> | undefined = header.column.columnDef.meta;
										if (meta) {
											if (meta.center) classes += "text-center ";
											if (meta.stretch === false) classes += "no-stretch ";
											classes = classes.slice(0, -1);
										}
										return (
											<th key={header.id} className={classes}>
												{header.isPlaceholder ? null : (
													<div
														{...{
															className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
															onClick: header.column.getToggleSortingHandler(),
														}}
													>
														{flexRender(header.column.columnDef.header, header.getContext())}
														{{
															asc: <FontAwesomeIcon icon={faArrowDownShortWide} className='ms-2' />,
															desc: <FontAwesomeIcon icon={faArrowUpWideShort} className='ms-2' />,
														}[header.column.getIsSorted() as string] ?? null}
													</div>
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody className='fenix'>
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										let meta: ColumnMeta<unknown, unknown> | undefined = cell.column.columnDef.meta;
										return (
											<td key={cell.id} className={`${meta && meta.center ? "text-center" : ""}`}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							))}
							{data.length === 0 ? (
								<tr className='text-center'>
									<td colSpan={columns.length}>
										<br />
										<br />
										No data to display
										<br />
										<br />
										<br />
									</td>
								</tr>
							) : data.length < 5 ? (
								<tr>
									<td colSpan={columns.length}>
										{new Array(5 - data.length).fill(0).map((_, i) => (
											<br key={i} />
										))}
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</div>
			<div className='row gy-3 justify-content-center mt-0'>
				{tableOptions.paginationFirst || tableOptions.paginationPrev ? (
					<div className='col-6 col-md-auto d-flex justify-content-start justify-content-md-end'>
						{tableOptions.paginationFirst ? (
							<button className='btn btn-primary shadow border-0 me-3' type='button' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
								<FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: "-6px" }} />
								<FontAwesomeIcon icon={faChevronLeft} className='me-md-1' />
								<span className='d-none d-sm-inline d-md-none d-lg-inline'>First</span>
							</button>
						) : null}
						{tableOptions.paginationPrev ? (
							<button className='btn btn-primary shadow border-0' type='button' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
								<FontAwesomeIcon icon={faChevronLeft} className='me-md-1' />
								<span className='d-none d-sm-inline d-md-none d-lg-inline'>Previous</span>
							</button>
						) : null}
					</div>
				) : null}
				{tableOptions.goToPage || tableOptions.pageIndex ? (
					<div className='col-12 col-md col-xl-5 col-xxl-4 order-last'>
						<div className='row gy-3 justify-content-center'>
							{tableOptions.goToPage ? (
								<div className='col-sm'>
									<div className='input-group shadow h-100'>
										<span className='input-group-text border-light'>Go to</span>
										<input
											className='bg-light bg-opacity-10 form-control border-light text-light'
											type='number'
											defaultValue={table.getState().pagination.pageIndex + 1}
											onChange={(e) => {
												let page: number = 0;
												if (e.target.value) {
													page = Number(e.target.value);
													if (page > table.getPageCount()) page = table.getPageCount();
													else if (page <= 0) page = 1;

													e.target.value = page.toString();
													page--;
												}
												table.setPageIndex(page);
											}}
										/>
									</div>
								</div>
							) : null}
							{tableOptions.pageIndex ? (
								<div className='col-auto'>
									<div className='input-group shadow w-auto'>
										<span className='input-group-text border-light'>
											Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
										</span>
									</div>
								</div>
							) : null}
						</div>
					</div>
				) : null}
				{tableOptions.paginationNext || tableOptions.paginationLast ? (
					<div className='col-6 col-md-auto d-flex justify-content-end justify-content-md-start order-md-last'>
						{tableOptions.paginationNext ? (
							<button className='btn btn-primary shadow border-0' type='button' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
								<span className='d-none d-sm-inline d-md-none d-lg-inline'>Next</span>
								<FontAwesomeIcon icon={faChevronRight} className='ms-md-1' />
							</button>
						) : null}
						{tableOptions.paginationLast ? (
							<button className='btn btn-primary shadow border-0 ms-3' type='button' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
								<span className='d-none d-sm-inline d-md-none d-lg-inline'>Last</span>
								<FontAwesomeIcon icon={faChevronRight} className='ms-md-1' />
								<FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: "-6px" }} />
							</button>
						) : null}
					</div>
				) : null}
			</div>
		</BaseTile>
	);
}
