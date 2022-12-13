import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {Link, useParams, useSearchParams} from "react-router-dom";
import {parseDate} from "../../utils/common";
import {datasetDownloaded} from "../../actions/dataset";
import {useDispatch} from "react-redux";
import {CardActionArea, IconButton, Tooltip} from "@mui/material";
import {Download} from "@mui/icons-material";
import {Favorite, Share} from "@material-ui/icons";
import {patchDatasetMetadata as patchDatasetMetadataAction} from "../../actions/metadata";
import {submitDatasetExtractionAction} from "../../actions/dataset";
import {submitFileExtractionAction} from "../../actions/file";

type ListenerCardProps = {
	id: string,
	name: string,
	description: string
}

export default function ListenerItem(props: ListenerCardProps) {
	console.log("Listener card");
	const {id, name, description} = props;

	let [searchParams, setSearchParams] = useSearchParams();
	const fileId = searchParams.get("fileId");
	console.log('the file id is', fileId);
	const datasetName = searchParams.get("datasetName");
	const fileName = searchParams.get("fileName");
	const datasetId = searchParams.get("datasetId");

	const dispatch = useDispatch();
	const submitFileExtraction = (fileId: string|undefined, extractor: string| undefined) => dispatch(submitFileExtractionAction(fileId,extractor));
	const submitDatasetExtraction = (datasetId: string| undefined, extractor: string| undefined) => dispatch(submitDatasetExtractionAction(datasetId, extractor));
	const downloadDataset = (datasetId: string | undefined, filename: string | undefined) => dispatch(datasetDownloaded(datasetId, filename))
	const submitExtraction = (datasetId: string | undefined, datasetName: string| undefined, fileId: string | undefined, fileName: string | undefined, extractor: string | undefined) => {
		console.log('submitting extraction');
		console.log(datasetId, datasetName, fileId, fileName);
		const extractionJson = {"extractor": name}
		console.log(extractionJson);
		console.log(typeof(extractionJson));
		if (fileId !== null && fileId !== undefined) {
			console.log("We have a file to extract");
			submitFileExtraction(fileId, name);


		}
		if (datasetId !== null && datasetId !== undefined){
			console.log("We have a dataset to extract")
			submitDatasetExtraction(datasetId, name);
		}


	}


	return (
		<Card key={id} sx={{height: "100%", display: "flex", flexDirection: "column"}}>
			<CardActionArea component={Link} to={`/listeners/${id}`} sx={{height: "100%"}}>
				<CardContent>
					<Typography variant="h5" component="div">
						{name}
					</Typography>
					{/*<Typography color="secondary">*/}
					{/*	{author}*/}
					{/*</Typography>*/}
					{/*<Typography sx={{mb: 1.5}} color="secondary">*/}
					{/*	{formattedCreated}*/}
					{/*</Typography>*/}
					<Typography variant="body2" sx={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: '5',
						WebkitBoxOrient: 'vertical',
					}}>
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions sx={{marginTop: "auto"}}>
				<Tooltip title="Submit">
					<IconButton onClick={() => submitExtraction(datasetId, datasetName, fileId, fileName, name)} color="primary" aria-label="download" sx={{mr: 3}}>
						<Download/>
					</IconButton>
				</Tooltip>
				{/*<Tooltip title="Favorite">*/}
				{/*	<IconButton color="primary" aria-label="favorite"  sx={{mr: 3}} disabled>*/}
				{/*		<Favorite/>*/}
				{/*	</IconButton>*/}
				{/*</Tooltip>*/}
				{/*<Tooltip title="Share">*/}
				{/*	<IconButton color="primary" aria-label="share"  sx={{mr: 3}} disabled>*/}
				{/*		<Share/>*/}
				{/*	</IconButton>*/}
				{/*</Tooltip>*/}
			</CardActions>
		</Card>
	);
}
