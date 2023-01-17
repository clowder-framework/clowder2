import React, {useState} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {submitDatasetExtractionAction} from "../../actions/dataset";
import {useDispatch} from "react-redux";
import {Button, IconButton, ListItem, ListItemText} from "@mui/material";
import {submitFileExtractionAction} from "../../actions/file";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {ExtractorInfo} from "../../openapi/v2";

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

	let [searchParams, setSearchParams] = useSearchParams();
	const dispatch = useDispatch();

	return (
		<ListItem key={id}>
			<Button
				disabled={(fileId !== undefined || datasetId !== undefined)
					?
					false
					:
					true}
				onClick={() => {
					setOpenSubmitExtraction(true);
					setSelectedExtractor(extractorInfo);

				}}>
				{extractorName}
			</Button>
			<ListItemText secondary={extractorDescription}/><IconButton component="label">
			<MoreVertIcon/>
		</IconButton>
		</ListItem>
	);

}
