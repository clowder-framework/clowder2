import React from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { EventListenerOut } from "../../openapi/v2";
import { theme } from "../../theme";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type ListenerCardProps = {
	id: string;
	fileId: string;
	datasetId: string;
	extractor: EventListenerOut;
	extractorName: string;
	extractorDescription: string;
	setOpenSubmitExtraction: any;
	setInfoOnly: any;
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
		setInfoOnly,
		setSelectedExtractor,
	} = props;

	return (
		<Box key={id} sx={{ display: "flex" }}>
			<Box>
				{!(fileId !== undefined || datasetId !== undefined) ||
				!extractor["alive"] ? (
					<Tooltip title="Extractor Offline">
						<FiberManualRecordIcon
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
				<Button
					onClick={() => {
						setOpenSubmitExtraction(true);
						setSelectedExtractor(extractor);
						setInfoOnly(true);
					}}
				>
					{extractorName}
				</Button>
				{!(fileId !== undefined || datasetId !== undefined) ||
				!extractor["alive"] ? (
					<Typography
						sx={{
							padding: "2em",
							color: "rgba(0, 0, 0, 0.26)",
							fontSize: "14px",
						}}
					>
						{extractorDescription}
					</Typography>
				) : (
					<Typography
						sx={{
							padding: "2em",
							color: theme.palette.info.main,
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
						setInfoOnly(false);
					}}
				>
					<PlayCircleIcon />
				</IconButton>
			</Box>
		</Box>
	);
}
