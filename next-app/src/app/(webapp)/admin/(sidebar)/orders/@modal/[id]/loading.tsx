"use client";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-bootstrap";

export default function Loading() {
	return (
		<Modal show={true} backdrop="static" keyboard={false} size="xl" centered fullscreen="md-down">
			<Modal.Body className="p-4 placeholder-glow">
				<div className="row">
					<div className="col-12 col-xl-4">
						<div className="bg-secondary bg-opacity-10 shadow-lg d-flex flex-column h-100 rounded-3 p-3">
							<h3 className="modal-title text-white lh-1">
								Order:
								<span className="float-end">
									<div className="placeholder w-50 h-100"></div>
								</span>
							</h3>
							<hr />
							<div className="table-responsive bg-transparent border-0 mb-auto">
								<div className="placeholder w-100 rounded mb-2" style={{ height: "40px" }}></div>
								<div className="placeholder w-100 rounded mb-2" style={{ height: "40px" }}></div>
								<div className="placeholder w-100 rounded mb-2" style={{ height: "40px" }}></div>
							</div>
							<hr />
							<form className="d-flex align-items-center position-relative">
								<div className="placeholder w-100 rounded" style={{ height: "40px" }}></div>
							</form>
							<hr />
							<div className="d-flex justify-content-between align-items-center mb-2">
								<p className="fs-4 mb-0 lh-1">Sum:</p>
								<div className="placeholder w-50 rounded" style={{ height: "40px" }}></div>
							</div>
							<div className="text-muted d-flex justify-content-between align-items-center">
								<p className="mb-0 lh-1">Without discount:</p>
								<div className="placeholder col-4 rounded" style={{ height: "30px" }}></div>
							</div>
						</div>
					</div>
					<div className="col-12 col-xl-8 py-4 ps-2">
						<form className="mb-4">
							<div className="row gy-3">
								<div className="col-12 col-sm-6">
									<label className="form-label mb-1 ms-2">First Name</label>
									<div className="placeholder w-100 rounded" style={{ height: "40px" }}></div>
								</div>
								<div className="col-12 col-sm-6">
									<label className="form-label mb-1 ms-2">Surname</label>
									<div className="placeholder w-100 rounded" style={{ height: "40px" }}></div>
								</div>
								<div className="col-7 col-sm-6">
									<label className="form-label mb-1 ms-2">Date</label>
									<div className="placeholder w-100 rounded" style={{ height: "40px" }}></div>
									<div className="mt-3">
										<label className="form-label mb-1 ms-2">E-Mail Address</label>
										<div className="placeholder w-100 rounded" style={{ height: "40px" }}></div>
									</div>
								</div>
								<div className="col-12 col-sm-6 d-flex flex-column">
									<label className="form-label mb-1 ms-2">Message from Buyer</label>
									<div className="placeholder w-100 flex-grow-1 rounded"></div>
								</div>
								<div className="col-12">
									<div className="d-flex flex-column">
										<label className="form-label mb-1 ms-2">Status</label>
										<div className="container">
											<div style={{ height: "40px" }} className="row">
												<div className="col-3">
													<div className="placeholder rounded h-100 w-100"></div>
												</div>
												<div className="col-3">
													<div className="placeholder rounded h-100 w-100"></div>
												</div>
												<div className="col-3">
													<div className="placeholder rounded h-100 w-100"></div>
												</div>
												<div className="col-3">
													<div className="placeholder rounded h-100 w-100"></div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>
						<div className="d-flex">
							<button className="btn btn-light d-flex align-items-center me-auto" type="button" disabled>
								Deliver Tickets
								<FontAwesomeIcon icon={faPaperPlane} className="ms-1" />
							</button>
							<button className="btn btn-outline-danger me-2" type="button" disabled>
								Cancel
							</button>
							<button className="btn btn-success" type="button" disabled>
								Save
							</button>
						</div>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
}
