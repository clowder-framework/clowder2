import React from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { EventListenerOut } from "../../openapi/v2";
import { theme } from "../../theme";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";

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
			<Box>
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
				{!(fileId !== undefined || datasetId !== undefined) ||
				!extractor["alive"] ? (
					<Tooltip title="Extractor offline">
						<CloseIcon
							color="error"
							fontSize="small"
							sx={{ verticalAlign: "middle" }}
						/>
					</Tooltip>
				) : (
					<Tooltip title="Extractor Alive">
						<FiberManualRecordIcon
							color="success"
							fontSize="small"
							sx={{ verticalAlign: "middle" }}
						/>
					</Tooltip>
				)}
				{!(fileId !== undefined || datasetId !== undefined) ||
				!extractor["alive"] ? (
					<Typography
						sx={{
							padding: "0.5em",
							color: "rgba(0, 0, 0, 0.26)",
							fontSize: "14px",
						}}
					>
						{extractorDescription}
					</Typography>
				) : (
					<Typography
						sx={{
							padding: "0.5em",
							color: theme.palette.primary.light,
							fontSize: "14px",
						}}
					>
						{extractorDescription}
					</Typography>
				)}
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
