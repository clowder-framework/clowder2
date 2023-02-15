import React from "react";
import {Box, Button, IconButton, Typography} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {ExtractorInfo} from "../../openapi/v2";
import {theme} from "../../theme";

type ListenerCardProps = {
	id: string,
	fileId: string,
	datasetId: string,
	extractorInfo: ExtractorInfo,
	extractorName: string,
	extractorDescription: string,
	setOpenSubmitExtraction: any,
	setSelectedExtractor: any
}

export default function ListenerItem(props: ListenerCardProps) {
	const {
		id,
		fileId,
		datasetId,
		extractorInfo,
		extractorName,
		extractorDescription,
		setOpenSubmitExtraction,
		setSelectedExtractor
	} = props;


	return (
		<Box key={id} sx={{ display: "flex" }}>
			<Box sx={{flexGrow: 1}}>
				<Button
					disabled={(fileId !== undefined || datasetId !== undefined)
						?
						false
						:
						true}
					onClick={() => {
						setOpenSubmitExtraction(true);
						setSelectedExtractor(extractorInfo);

					}}
				>
					{extractorName}
				</Button>
				<Typography sx={{padding: "0.5em", color:theme.palette.secondary.main, fontSize:"14px"}}>
					{extractorDescription}</Typography>
			</Box>
			<IconButton component="label">
			<MoreVertIcon/>
		</IconButton>
		</Box>
	);

}
