import React from "react";
import FileSelectorButton from "../navigation/FileSelector";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderFileSelector = (item) => {
	const handleChange = (value) => {
		item.onChange(value);
	};
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<FileSelectorButton onChange={handleChange} />
		</>
	);
};
