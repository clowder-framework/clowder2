import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Link, useNavigate} from "react-router-dom";
import {parseDate} from "../../utils/common";
import {datasetDownloaded} from "../../actions/dataset";
import {useDispatch} from "react-redux";
import {CardActionArea} from "@mui/material";

type DatasetCardProps = {
	id: string,
	name: string,
	author: string,
	created: string | Date,
	description: string
}

export default function DatasetCard(props: DatasetCardProps) {
	const {	id, name, author, created, description} = props;

	const dispatch = useDispatch();
	const downloadDataset = (datasetId:string|undefined, filename:string|undefined) => dispatch(datasetDownloaded(datasetId, filename))

	const formattedCreated = parseDate(created);

	return (
		<Card key={id} sx={{minWidth: 350}}>
			<CardActionArea component={Link} to={`/datasets/${id}`}>
				<CardContent>
					<Typography variant="h5" component="div">
						{name}
					</Typography>
					<Typography color="secondary">
						{author}
					</Typography>
					<Typography sx={{mb: 1.5}} color="secondary">
						{formattedCreated}
					</Typography>
					<Typography variant="body2">
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions>
				<Button size="small" onClick={() => downloadDataset(id, name)}>Download</Button>
			</CardActions>
		</Card>
	);
}
