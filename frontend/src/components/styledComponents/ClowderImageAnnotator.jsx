import React from "react";
import ImageAnnotator from "../input/ImageAnnotator";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderImageAnnotator = (item) => {
	const handleChange = (value) => {
		item.onChange(JSON.stringify(value));
	};

	const fileId = item.options.fileId;
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<ImageAnnotator fileId={fileId} onChange={handleChange} />
		</>
	);
};
