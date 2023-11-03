import React from "react";

import { Box, Input } from "@mui/material";

type UploadFileMultipleModalProps = {
	setSelectedFiles: any;
};

// https://stackoverflow.com/questions/68213700/react-js-upload-multiple-files
export const UploadFileInputMultiple: React.FC<UploadFileMultipleModalProps> = (
	props: UploadFileMultipleModalProps
) => {
	const { setSelectedFiles } = props;

	const handleMultipleFileChange = (event) => {
		// let tempFormData = new FormData();
		// for (let i = 0; i < event.target.files.length; i++) {
		// 	tempFormData.append("files", event.target.files[i]);
		// }
		setSelectedFiles(event.target.files);
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
