import React from "react";
import FileSystemSelectorButton from "../navigation/FileSystemSelector";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderFileSystemSelector = (item) => {
	const handleChange = (value) => {
		item.onChange(value);
	};
	const datasetId = item.options.datasetId;
	const showOnlyDatasetFiles = item.schema.showOnlyDatasetFiles ? true : false;
	const selectFolder = item.schema.selectFolder ? true : false;
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<FileSystemSelectorButton
				showOnlyDatasetFiles={showOnlyDatasetFiles}
				datasetId={datasetId}
				onChange={handleChange}
				selectFolder={selectFolder}
			/>
		</>
	);
};
