import BaseTile from "@/components/tiles/base-tile";

export default async function Loading() {
	return (
		<BaseTile title="Latest sales" className="col-12 col-lg-4" style={{ minHeight: "500px" }}>
			<div className="h-100 w-100 d-flex flex-column">
				<div className="placeholder mb-2 flex-grow-1 rounded"></div>
				<div className="placeholder mb-2 flex-grow-1 rounded"></div>
				<div className="placeholder mb-2 flex-grow-1 rounded"></div>
				<div className="placeholder mb-2 flex-grow-1 rounded"></div>
				<div className="placeholder mb-2 flex-grow-1 rounded"></div>
				<div className="placeholder flex-grow-1 rounded"></div>
			</div>
		</BaseTile>
	);
}
