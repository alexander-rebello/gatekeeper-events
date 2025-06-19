import ListTile, { ListData } from "@/components/tiles/data-visualisation/list-tile";
import { getListData } from "../data";
import { validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function List() {
	const { session } = await validateRequest(true);

	if (!session) redirect("/login");

	if (session.currentEventId === null) redirect("/admin/events");

	const listData: ListData = await getListData(session.currentEventId);

	return <ListTile title="Latest Orders" className="col-12 col-lg-4" data={listData} />;
}
