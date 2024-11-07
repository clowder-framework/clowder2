import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { parseDate } from "../../utils/common";
import {
	CardActionArea,
	CardHeader,
	CardMedia,
	IconButton,
	Tooltip,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { generateThumbnailUrl } from "../../utils/visualization";
import config from "../../app.config";
// import {Favorite, Share} from "@material-ui/icons";

type PublicDatasetCardProps = {
	id?: string;
	name?: string;
	author?: string;
	created?: string | Date;
	description?: string;
	thumbnailId?: string;
	publicView?: boolean | false;
	frozen?: boolean | false;
	frozenVersionNum?: number;
	status?: string;
};

export default function PublicDatasetCard(props: PublicDatasetCardProps) {
	const {
		id,
		name,
		author,
		created,
		description,
		thumbnailId,
		publicView,
		status,
	} = props;

	const [thumbnailUrl, setThumbnailUrl] = useState("");

	useEffect(() => {
		let url = "";
		if (thumbnailId) {
			url = generateThumbnailUrl(thumbnailId);
		}
		setThumbnailUrl(url);
	}, [thumbnailId]);

	const formattedCreated = parseDate(created, "PP");
	const subheader = `${formattedCreated} \u00B7 ${author}`;

	return (
		<Card
			key={id}
			sx={{ display: "flex", flexDirection: "column", height: "100%" }}
			variant="outlined"
		>
			{publicView ? (
				<CardActionArea
					component={Link}
					to={`/public_datasets/${id}`}
					sx={{ height: "100%" }}
				>
					<CardHeader title={name} subheader={subheader} />
					{thumbnailId ? (
						<CardMedia
							component="img"
							image={thumbnailUrl}
							alt={`${name}_thumbnail`}
						/>
					) : null}
					<CardContent sx={{ py: 0 }}>
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
			) : (
				<CardActionArea
					component={Link}
					to={`/datasets/${id}`}
					sx={{ height: "100%" }}
				>
					<CardHeader title={name} subheader={subheader} />
					{thumbnailId ? (
						<CardMedia
							component="img"
							image={thumbnailUrl}
							alt={`${name}_thumbnail`}
						/>
					) : null}
					<CardContent sx={{ py: 0 }}>
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
			)}
			<CardActions sx={{ pb: 0, justifyContent: "space-between" }}>
				<Tooltip title="Download">
					<IconButton
						href={`${config.hostname}/api/v2/public_datasets/${id}/download`}
						color="primary"
						aria-label="download"
						sx={{ mr: 3 }}
					>
						<Download />
					</IconButton>
				</Tooltip>
				<Typography>{status}</Typography>
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
