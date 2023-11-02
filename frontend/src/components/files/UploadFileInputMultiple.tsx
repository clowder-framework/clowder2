import React from "react";

import { Box, Input } from "@mui/material";

type UploadFileMultipleModalProps = {
	setSelectedFiles: any;
	// multipleFilesFormData: FormData;
	setMultipleFilesFormData: any;
};

// https://stackoverflow.com/questions/68213700/react-js-upload-multiple-files
export const UploadFileInputMultiple: React.FC<UploadFileMultipleModalProps> = (
	props: UploadFileMultipleModalProps
) => {
	const { setSelectedFiles, setMultipleFilesFormData } = props;

	const handleMultipleFileChange = (event) => {
		setSelectedFiles(event.target.files);
		let tempFormData = new FormData();
		for (let i = 0; i < event.target.files.length; i++) {
			tempFormData.append("files", event.target.files[i]);
			// setMultipleFilesFormData.append("files", (event.target.files[i]));
		}
		setMultipleFilesFormData(tempFormData);
	};

	return (
		<Box sx={{ width: "100%", padding: "1em 0em" }}>
			<Input
				id="file-input-multiple"
				type="file"
				inputProps={{ multiple: true }}
				onChange={handleMultipleFileChange}
				sx={{ width: "100%" }}
				disableUnderline={true}
			/>
		</Box>
	);
};
