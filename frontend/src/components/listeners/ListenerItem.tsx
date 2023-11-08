import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { EventListenerOut } from "../../openapi/v2";
import { theme } from "../../theme";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import Chip from "@mui/material/Chip";

type ListenerCardProps = {
	id: string;
	fileId: string;
	datasetId: string;
	extractor: EventListenerOut;
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
		extractor,
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
						!(fileId !== undefined || datasetId !== undefined) ||
						!extractor["alive"]
					}
					onClick={() => {
						setOpenSubmitExtraction(true);
						setSelectedExtractor(extractor);
					}}
				>
					{extractorName}
				</Button>
				{extractor["version"] ? (
					<Chip label={`v${extractor["version"]}`} size="small" />
				) : (
					<></>
				)}
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
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					justifyContent: "end",
					margin: "auto",
				}}
			>
				<IconButton
					color="primary"
					disabled={
						!(fileId !== undefined || datasetId !== undefined) ||
						!extractor["alive"]
					}
					onClick={() => {
						setOpenSubmitExtraction(true);
						setSelectedExtractor(extractor);
					}}
				>
					<PlayCircleIcon />
				</IconButton>
			</Box>
		</Box>
	);
}
