"use client";

import { useActionState, useEffect, useState } from "react";
import { HEX_REGEX, formatDate } from "@/components/utils";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { useFormStatus } from "react-dom";
import editUserAction from "./actions";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import LabelAddition from "@/components/forms/labelAddition";
import DynamicTableTile from "@/components/tiles/data-visualisation/dynamic-table-tile";

export type User = {
	id: number;
	firstName: string;
	lastName: string;
	roleId: number;
	allRoles: {
		id: number;
		name: string;
		permissions: number[];
	}[];
	allPermissions: {
		id: number;
		name: string;
		description: string | null;
	}[];
};

export default function EditUsersModal({ data }: { data: User }) {
	const [show, setShow] = useState<boolean>(false);

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editUserAction, { message: undefined });

	/*
		0=Show delete button (inital; when clicked, switch to 1)
		1=Wait for 1 second, then switch to 2
		2=Show confirm delete button (when clicked, close modal via form submission)
	*/
	const [confirmDelete, setConfirmDelete] = useState<number>(0);

	/*
		0=Show close button (initial; when clicked, switch to 1)
		1=Wait for 1 second, then switch to 2
		2=Show confirm close button (when clicked, close modal via redirect)
	*/
	const [confirmClose, setConfirmClose] = useState<number>(0);

	const [role, setRole] = useState<number>(data.roleId);

	const router = useRouter();

	useEffect(() => setShow(true), []);

	useEffect(() => {
		if (confirmClose == 1) setTimeout(() => setConfirmClose(2), 500);
		else if (confirmClose == 2) setTimeout(() => setConfirmClose(0), 3000);
	}, [confirmClose]);

	useEffect(() => {
		if (confirmDelete == 1) setTimeout(() => setConfirmDelete(2), 500);
		else if (confirmDelete == 2) setTimeout(() => setConfirmDelete(0), 3000);
	}, [confirmDelete]);

	useEffect(() => {
		if (state.message === "success") router.back();
	}, [state]);

	const changesMade = role !== data.roleId;

	const currenRole = data.allRoles.find((r) => r.id === role);

	return (
		<Modal show={show} onHide={() => {}} backdrop='static' keyboard={false} size='xl' centered fullscreen='md-down'>
			<Modal.Body className='p-4 rounded border border-dark d-flex flex-column' style={{ maxHeight: "90vh" }}>
				<div className='d-flex flex-column overflow-hidden'>
					<form action={formAction} id='deleteForm'>
						<input type='hidden' name='action' value='delete' />
						<input type='hidden' name='id' value={data.id} />
					</form>
					<form action={formAction} className='overflow-hidden d-flex flex-column'>
						<input type='hidden' name='id' value={data?.id ?? "new"} />
						<div className='px-2'>
							<div className='d-flex justify-content-between align-items-center'>
								<h3 className='mb-0'>{data ? "Edit" : "Create"} User</h3>
								{changesMade && (
									<div className='d-flex align-items-center text-warning'>
										<FontAwesomeIcon icon={faTriangleExclamation} />
										<p className='mb-0 ms-2'>Unsaved changes</p>
									</div>
								)}
							</div>
						</div>
						<hr />
						<div className='row mb-4'>
							<div className='col-12 col-lg-6'>
								<div>
									<label className='form-label mb-1 ms-2' htmlFor='role'>
										User
									</label>
									<div className='input-group'>
										<span className='input-group-text bg-light bg-opacity-10 text-white fenix border-light w-100'>{`${data.firstName} ${data.lastName}`}</span>
									</div>
								</div>
							</div>
							<div className='col-12 col-lg-6'>
								<div>
									<label className='form-label mb-1 ms-2' htmlFor='role'>
										Role
									</label>
									{data.roleId === -1 ? (
										<div className='input-group'>
											<span className='input-group-text bg-light bg-opacity-10 text-white fenix border-light w-100'>{currenRole?.name}</span>
										</div>
									) : (
										<select className='bg-light bg-opacity-10 form-select text-white fenix border-light' value={role} onChange={(e) => setRole(Number(e.target.value))} id='role' name='role'>
											{data.allRoles.map((role) => (
												<option key={role.id} value={role.id}>
													{role.name}
												</option>
											))}
										</select>
									)}
								</div>
							</div>
						</div>
						<div className='mb-3 overflow-y-auto'>
							<table className='table table-striped table-bordered mb-0'>
								<thead>
									<tr>
										<th>Permission</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody className='table-group-divider'>
									{data.allPermissions.map((perm, idx) => {
										const has = currenRole?.permissions.includes(perm.id);
										return (
											<tr key={idx}>
												<td className={has ? "" : "text-secondary"}>{perm.name}</td>
												<td className={has ? "" : "text-secondary"}>{perm.description ? (has ? perm.description : perm.description.replace("Can", "Cannot")) : ""}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<p className='text-center text-danger'>{typeof state?.message == "string" ? state?.message : ""}</p>
						<div className='d-flex'>
							{data.roleId !== -1 ? (
								confirmDelete == 0 ? (
									<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDelete(1)}>
										Remove
									</button>
								) : (
									<button className='btn btn-danger px-4' type='submit' form='deleteForm' disabled={confirmDelete !== 2}>
										Confirm Remove
									</button>
								)
							) : (
								<p className='text-muted'>Owner cannot be removed/edited</p>
							)}
							{!changesMade ? (
								<button className='btn btn-outline-danger ms-auto me-2 px-4' type='button' onClick={() => router.back()}>
									Close
								</button>
							) : confirmClose == 0 ? (
								<button className='btn btn-outline-danger ms-auto me-2 px-4' type='button' onClick={() => setConfirmClose(1)}>
									Close
								</button>
							) : (
								<button className='btn btn-danger ms-auto me-2 px-4' type='button' onClick={() => router.back()} disabled={confirmClose !== 2}>
									Confirm Close
								</button>
							)}
							{data.roleId !== -1 && (
								<button className='btn btn-success px-4' type='submit' disabled={pending}>
									{pending ? "Saving..." : "Save"}
								</button>
							)}
						</div>
					</form>
				</div>
			</Modal.Body>
		</Modal>
	);
}
