import React from "react";

import { Box, Input } from "@mui/material";

type UploadFileModalProps = {
	setSelectedFile: any;
};

export const UploadFileInput: React.FC<UploadFileModalProps> = (
	props: UploadFileModalProps
) => {
	const { setSelectedFile } = props;

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	return (
		<Box sx={{ width: "100%", padding: "1em 0em" }}>
			<Input
				id="file-input"
				type="file"
				onChange={handleFileChange}
				sx={{ width: "100%" }}
				disableUnderline={true}
			/>
		</Box>
	);
};
