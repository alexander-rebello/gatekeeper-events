import ListTile, { ListData } from "@/components/tiles/data-visualisation/list-tile";
import { getListData } from "../data";
import { checkSuperAdmin, validateRequest } from "@/auth/lucia";
import { redirect } from "next/navigation";

export default async function List() {
	const listData: ListData = await getListData();

	return <ListTile title='Latest Sign-Ups' className='col-12 col-lg-4' data={listData} />;
}
