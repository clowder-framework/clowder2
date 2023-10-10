import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { ExtractorInfo } from "../../openapi/v2";
import { theme } from "../../theme";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

type ListenerCardProps = {
	id: string;
	fileId: string;
	datasetId: string;
	extractorInfo: ExtractorInfo;
	extractorName: string;
	extractorDescription: string;
	setOpenSubmitExtraction: any;
	setSelectedExtractor: any;
};

export default function ListenerItem(props: ListenerCardProps) {
	const {
		id,
		fileId,
		datasetId,
		extractorInfo,
		extractorName,
		extractorDescription,
		setOpenSubmitExtraction,
		setSelectedExtractor,
	} = props;

	return (
		<Box key={id} sx={{ display: "flex" }}>
			<Box sx={{ flexGrow: 1 }}>
				<Button
					disabled={
						fileId !== undefined || datasetId !== undefined ? false : true
					}
					onClick={() => {
						setOpenSubmitExtraction(true);
						setSelectedExtractor(extractorInfo);
					}}
				>
					{extractorName}
				</Button>
				<Typography
					sx={{
						padding: "0.5em",
						color: theme.palette.primary.light,
						fontSize: "14px",
					}}
				>
					{extractorDescription}
				</Typography>
			</Box>
			<IconButton
				color="primary"
				disabled={
					fileId !== undefined || datasetId !== undefined ? false : true
				}
				onClick={() => {
					setOpenSubmitExtraction(true);
					setSelectedExtractor(extractorInfo);
				}}
			>
				<PlayCircleIcon />
			</IconButton>
		</Box>
	);
}
