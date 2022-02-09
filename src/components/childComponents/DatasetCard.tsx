import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { parseISO, format } from 'date-fns'
import {useNavigate} from "react-router-dom";

type DatasetCardProps = {
	id: string,
	name: string,
	author: string,
	created: string
	description: string
}

export default function DatasetCard(props: DatasetCardProps) {
	const {	id, name, author, created, description} = props;
	const formattedCreated = format(parseISO(created), "MM/dd/yyyy");
	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	const selectDataset = (selectedDatasetId: string) => {
		// Redirect to dataset route with dataset Id
		history(`/datasets/${selectedDatasetId}`);
	};
	return (
		<Card key={id}>
			<CardContent>
				<Typography variant="h5" component="div">
					{name}
				</Typography>
				<Typography color="text.secondary">
					{author}
				</Typography>
				<Typography sx={{ mb: 1.5 }} color="text.secondary">
					{formattedCreated}
				</Typography>
				<Typography variant="body2">
					{description}
				</Typography>
			</CardContent>
			<CardActions>
				<Button size="small" onClick={() => selectDataset(id)}>View</Button>
				<Button size="small" disabled={true}>Share</Button>
			</CardActions>
		</Card>
	);
}
