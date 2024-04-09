import React from "react";
import { Box, IconButton } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

type MetadataEditButtonType = {
	readOnly: boolean;
	setReadOnly: any;
	updateMetadata: any;
	content: object;
	metadataId: string | undefined;
	resourceId: string | undefined;
	widgetName: string;
	setInputChanged: any;
	setMetadata: any;
};

export const MetadataEditButton = (props: MetadataEditButtonType) => {
	const {
		readOnly,
		setReadOnly,
		metadataId,
		updateMetadata,
		setMetadata,
		resourceId,
		content,
		widgetName,
		setInputChanged,
	} = props;

	return (
		<>
			{readOnly ? (
				<Box>
					<IconButton
						color="primary"
						aria-label="Cancel"
						onClick={() => {
							setReadOnly(false);
						}}
					>
						<EditIcon />
					</IconButton>
				</Box>
			) : (
				<Box>
					{metadataId ? (
						// if setMetadata exist; don't show the individual update button;
						// will update all metadata at form level
						setMetadata ? (
							<></>
						) : (
							<>
								<IconButton
									color="primary"
									aria-label="Cancel"
									onClick={() => {
										setReadOnly(true);
										setInputChanged(false);
									}}
								>
									<HighlightOffIcon />
								</IconButton>
								<IconButton
									color="primary"
									aria-label="Update"
									onClick={() => {
										// update metadata
										updateMetadata(resourceId, {
											id: metadataId,
											definition: widgetName,
											content: content,
										});
										setReadOnly(true);
										setInputChanged(false);
									}}
								>
									<CheckCircleIcon />
								</IconButton>
							</>
						)
					) : (
						<></>
					)}
				</Box>
			)}
		</>
	);
};
