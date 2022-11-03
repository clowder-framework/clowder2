import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {Link} from "react-router-dom";
import {parseDate} from "../../utils/common";
import {useDispatch} from "react-redux";
import {CardActionArea, IconButton, Tooltip} from "@mui/material";
import {Favorite, Share} from "@material-ui/icons";

type ListenerCardProps = {
	id: string,
	name: string,
	description: string
}

export default function ListenerCard(props: ListenerCardProps) {
	const {id, name, description} = props;

	// const dispatch = useDispatch();

	return (
		<Card key={id} sx={{height: "100%", display: "flex", flexDirection: "column"}}>
			<CardActionArea component={Link} to={`/datasets/${id}`} sx={{height: "100%"}}>
				<CardContent>
					<Typography variant="h5" component="div">
						{name}
					</Typography>
					<Typography color="secondary">
						{id}
					</Typography>
					<Typography sx={{mb: 1.5}} color="secondary">
						{name}
					</Typography>
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
				<Tooltip title="Favorite">
					<IconButton color="primary" aria-label="favorite"  sx={{mr: 3}} disabled>
						<Favorite/>
					</IconButton>
				</Tooltip>
				<Tooltip title="Share">
					<IconButton color="primary" aria-label="share"  sx={{mr: 3}} disabled>
						<Share/>
					</IconButton>
				</Tooltip>
			</CardActions>
		</Card>
	);
}
