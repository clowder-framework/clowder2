import React from "react";
import FileSelectorButton from "../navigation/FileSelector";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderFileSelector = (item) => {
	const handleChange = (value) => {
		item.onChange(value);
	};
	const datasetId = item.options.datasetId;
	const showOnlyDatasetFiles = item.schema.showOnlyDatasetFiles ? true : false;
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<FileSelectorButton
				showOnlyDatasetFiles={showOnlyDatasetFiles}
				datasetId={datasetId}
				onChange={handleChange}
			/>
		</>
	);
};
