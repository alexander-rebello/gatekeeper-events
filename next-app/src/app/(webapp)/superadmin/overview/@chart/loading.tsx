import BaseTile from "@/components/tiles/base-tile";

export default async function Loading() {
	return (
		<BaseTile title="Sales of the last month" className="col-12 col-lg-8" style={{ minHeight: "500px" }}>
			<div className="placeholder h-100 w-100 rounded"></div>
		</BaseTile>
	);
}
