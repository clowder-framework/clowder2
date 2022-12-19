import React from "react";
import {useSearchParams} from "react-router-dom";
import {submitDatasetExtractionAction} from "../../actions/dataset";
import {useDispatch} from "react-redux";
import {Button, IconButton, ListItem, ListItemText} from "@mui/material";
import {submitFileExtractionAction} from "../../actions/file";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {ExtractorInfo} from "../../openapi/v2";

type ListenerCardProps = {
	id: string,
	extractorInfo: ExtractorInfo,
	extractorName: string,
	extractorDescription: string,
	setOpenSubmitExtraction: any,
	setSelectedExtractor: any
}

export default function ListenerItem(props: ListenerCardProps) {
	const {id, extractorInfo, extractorName, extractorDescription, setOpenSubmitExtraction, setSelectedExtractor} = props;

	let [searchParams, setSearchParams] = useSearchParams();
	const fileId = searchParams.get("fileId");
	const datasetId = searchParams.get("datasetId");

	const dispatch = useDispatch();
	const submitFileExtraction = (fileId: string | undefined, extractor: string | undefined) => dispatch(submitFileExtractionAction(fileId, extractor));
	const submitDatasetExtraction = (datasetId: string | undefined, extractor: string | undefined) => dispatch(submitDatasetExtractionAction(datasetId, extractor));
	if (fileId !== null && fileId !== undefined) {
		submitFileExtraction(fileId, extractorName);
	}
	if (datasetId !== null && datasetId !== undefined) {
		submitDatasetExtraction(datasetId, extractorName);
	}

	return (
		<ListItem key={id}>
			<Button onClick={()=> {
				setOpenSubmitExtraction(true);
				setSelectedExtractor(extractorInfo);
			}}>
				{extractorName}
			</Button>
			<ListItemText secondary={extractorDescription} /><IconButton component="label">
				<MoreVertIcon />
			</IconButton>
		</ListItem>
	);

}
