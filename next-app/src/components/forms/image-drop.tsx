"use client";
import Image from "next/image";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faFloppyDisk, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export type ImageUpload = {
	title: string;
	id: string;
	url?: string;
};

export type ImageEditError = { message: string | undefined; url?: string };

export type ImageUploadAction = (prevState: ImageEditError, formData: FormData) => Promise<ImageEditError>;

export default function ImageDrop({ className = "", sizes = "100vw", imageUpload, mimeTypes = "image/*", action, canEdit = true }: { className?: string; sizes?: string; imageUpload: ImageUpload; mimeTypes?: string; action: ImageUploadAction; canEdit?: boolean }) {
	if (!canEdit && imageUpload.url === undefined) return null;

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(action, { message: undefined });

	const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(imageUpload.url ?? null);
	const [upToDate, setUpToDate] = useState(true);

	const hiddenInputRef = useRef<HTMLInputElement>(null);

	const onDelete = () => {
		setUpToDate(imageUpload.url === undefined);
		setImagePreview(null);

		if (hiddenInputRef.current) {
			const dataTransfer = new DataTransfer();
			hiddenInputRef.current.files = dataTransfer.files;
		}
	};

	const onUpload = useCallback((acceptedFiles: Array<File>) => {
		setUpToDate(false);
		const reader = new FileReader();

		reader.onload = () => setImagePreview(reader.result);

		reader.readAsDataURL(acceptedFiles[0]);

		if (hiddenInputRef.current) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(acceptedFiles[0]);
			hiddenInputRef.current.files = dataTransfer.files;
		}
	}, []);

	useEffect(() => {
		if (state.message === undefined || state.message === "success") setUpToDate(true);
		if (state.message === "success" && state.url !== undefined) setImagePreview(state.url);
	}, [state]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onUpload, multiple: false });

	return (
		<form className={className} action={formAction}>
			<input type='hidden' name='id' value={imageUpload.id} />
			<div className='d-flex align-items-center'>
				<label className='mb-0 me-auto' htmlFor={imageUpload.id}>
					{imageUpload.title}
				</label>
				{canEdit && (
					<>
						<button className={"border-0 bg-transparent me-1 text-" + (upToDate ? "secondary" : "warning")} disabled={upToDate || pending} type='submit'>
							<FontAwesomeIcon icon={faFloppyDisk} />
						</button>
						|
						<button className={"border-0 bg-transparent ms-1 text-" + (imagePreview ? "danger" : "secondary")} onClick={onDelete} disabled={imagePreview === null} type='button'>
							<FontAwesomeIcon icon={faTrashCan} />
						</button>
					</>
				)}
			</div>
			{state.message && state.message !== "success" && !upToDate && <p className='text-danger'>{state.message}</p>}
			<div className='position-relative mt-3' style={{ height: "150px" }}>
				{imagePreview ? (
					<Image className='rounded-3 w-100' src={imagePreview as string} alt='Image preview' fill={true} sizes={sizes} />
				) : (
					<div {...getRootProps()} className={"d-flex flex-column justify-content-center align-items-center p-3 rounded-3 bg-light bg-opacity-10 position-relative border-dashed h-100" + (isDragActive ? " border-primary" : "")}>
						<p className='mb-2'>Drop Image</p>
						<label className='btn btn-outline-light mb-2' htmlFor={imageUpload.id}>
							<FontAwesomeIcon icon={faCloudArrowUp} className='me-1' />
							Choose File
						</label>
					</div>
				)}
			</div>
			<input {...getInputProps()} className='d-none' type='file' accept={mimeTypes} name='file' id={imageUpload.id} ref={hiddenInputRef} />
		</form>
	);
}
