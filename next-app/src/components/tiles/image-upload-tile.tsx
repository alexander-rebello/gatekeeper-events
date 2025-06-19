import ImageDrop, { ImageUpload } from "../forms/image-drop";
import { NonEmptyArray } from "../utils";
import BaseTile from "./base-tile";

export default function ImageUploadTile({ className = "", sizes = "100vw", uploadIds, title = "Images", action, canEdit = true }: { className?: string; sizes?: string; uploadIds: NonEmptyArray<ImageUpload>; title?: string; action: any; canEdit?: boolean }) {
	return (
		<BaseTile title={title} className={className}>
			<div className='row gy-4 justify-content-center'>
				{uploadIds.map((imgUpl, i) => (
					<ImageDrop key={imgUpl.id} sizes={sizes} className='col-12 col-md-6 col-xl-12' imageUpload={imgUpl} action={action} canEdit={canEdit} />
				))}
			</div>
		</BaseTile>
	);
}
