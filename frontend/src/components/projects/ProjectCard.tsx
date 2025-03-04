import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";
import {parseDate} from "../../utils/common";
import {Box, CardActionArea, CardHeader, Tooltip,} from "@mui/material";
import {Dataset,} from "@mui/icons-material";

type ProjectCardProps = {
	id?: string;
	name?: string;
	author?: string;
	created?: string | Date;
	description?: string;
	numDatasets?: number;
	numUsers?: number;
};

export default function ProjectCard(props: ProjectCardProps) {
	const {
		id,
		name,
		author,
		created,
		description,
		numDatasets,
		numUsers,
	} = props;

	const formattedCreated = parseDate(created, "PP");
	const subheader = `${formattedCreated} \u00B7 ${author}`;

	return (
		<Card
			key={id}
			sx={{display: "flex", flexDirection: "column", height: "100%"}}
			variant="outlined"
		>
			<CardActionArea
				component={Link}
				to={`/projects/${id}`}
				sx={{height: "100%"}}
			>
				<CardHeader title={name} subheader={subheader}/>
				<CardContent sx={{py: 0}}>
					<Typography
						variant="body2"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: "5",
							WebkitBoxOrient: "vertical",
						}}
					>
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions sx={{pb: 0, justifyContent: "space-between"}}>
				<Box style={{display: "flex", alignItems: "center"}}>
					<Tooltip title="Datasets">
						<Box
							style={{display: "flex", alignItems: "center", marginRight: 8}}
						>
							<Dataset fontSize="small"/>
							<Typography variant="body2" sx={{ml: 0.5}}>
								{numDatasets ?? 0}
							</Typography>
						</Box>
					</Tooltip>
					<Tooltip title="Users">
						<Box
							style={{display: "flex", alignItems: "center", marginRight: 8}}
						>
							<Dataset fontSize="small"/>
							<Typography variant="body2" sx={{ml: 0.5}}>
								{numUsers ?? 0}
							</Typography>
						</Box>
					</Tooltip>
				</Box>
			</CardActions>
		</Card>
	);
}
