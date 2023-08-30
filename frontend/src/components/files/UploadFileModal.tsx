import React from "react";

import { Box, Button, Container, Input } from "@mui/material";

type UploadFileModalProps = {
	onSave: any;
};

export const UploadFileModal: React.FC<UploadFileModalProps> = (
	props: UploadFileModalProps
) => {
	const { onSave } = props;
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	return (
		<Container sx={{ width: "100%", padding: "1em" }}>
			<Input
				id="file-input"
				type="file"
				onChange={handleFileChange}
				sx={{ width: "100%" }}
			/>
			<Box className="inputGroup">
				<Button
					variant="contained"
					onClick={() => {
						onSave(selectedFile);
					}}
					disabled={!selectedFile}
				>
					Upload
				</Button>
			</Box>
		</Container>
	);
};
