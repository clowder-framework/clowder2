import * as React from "react";
import {
	Box,
	Link as MuiLink,
	List,
	ListItem,
	ListItemAvatar,
	Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import DatasetIcon from "@mui/icons-material/Dataset";
import ArticleIcon from "@mui/icons-material/Article";
import { parseDate } from "../../utils/common";
import { theme } from "../../theme";

import parse from "html-react-parser";

// Function to parse the elastic search parameter
// If it contains HTML tags like <mark>, it removes them
// If there is no HTML tags, it returns the original string
function parseString(str: string) {
	try {
		const parsedHtml = parse(str);
		return parsedHtml;
	} catch (error) {
		return str;
	}
}

function getRecordType(item) {
	if (item._index === "dataset") return "dataset";
	if (item._index === "file") return "file";
	if (item._index === "metadata") {
		// TODO: How to handle duplicate search results here?
		if (item.dataset_id === undefined)
			// Only files have this field
			return "file";
		else return "dataset";
	}
}

function buildDatasetResult(item) {
	return (
		<>
			<ListItemAvatar sx={{ color: theme.palette.primary.main }}>
				<DatasetIcon />
			</ListItemAvatar>
			<Box sx={{ marginTop: "5px" }}>
				<MuiLink
					component={Link}
					to={`/datasets/${item._id}`}
					sx={{ fontWeight: "bold", fontSize: "18px" }}
				>
					{parseString(item.name)}
				</MuiLink>
				<Typography variant="body2" color={theme.palette.secondary.light}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
				<Typography variant="body2" color={theme.palette.secondary.dark}>
					{parseString(item.description)}
				</Typography>
			</Box>
		</>
	);
}

function buildFileResult(item) {
	return (
		<>
			<ListItemAvatar sx={{ color: theme.palette.primary.main }}>
				<ArticleIcon />
			</ListItemAvatar>
			<Box sx={{ marginTop: "5px" }}>
				<MuiLink
					component={Link}
					to={`/files/${item._id}?dataset=${item.dataset_id}`}
					sx={{ fontWeight: "bold", fontSize: "18px" }}
				>
					{parseString(item.name)}
				</MuiLink>
				<Typography variant="body2" color={theme.palette.secondary.light}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
				<Typography variant="body2" color={theme.palette.secondary.dark}>
					{`${item.content_type} | ${item.bytes} bytes`}
				</Typography>
			</Box>
		</>
	);
}

function buildMetadataResult(item) {
	return (
		<>
			<ListItemAvatar sx={{ color: theme.palette.primary.main }}>
				<ArticleIcon />
			</ListItemAvatar>
			<Box sx={{ marginTop: "5px" }}>
				<MuiLink
					component={Link}
					to={
						item.resource_type === "dataset"
							? `/datasets/${item.resource_id}`
							: `/files/${item.resource_id}?dataset=${item.file_dataset_id}`
					}
					sx={{ fontWeight: "bold", fontSize: "18px" }}
				>
					{parseString(item.resource_name)}
				</MuiLink>
				<Typography variant="body2" color={theme.palette.secondary.light}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
				<Typography variant="body2" color={theme.palette.secondary.dark}>
					{item.resource_type === "dataset"
						? parseString(item.ds_description)
						: `${item.file_content_type} | ${item.file_bytes} bytes`}
				</Typography>
			</Box>
		</>
	);
}

export function SearchResult(props) {
	const { data } = props;

	return (
		<List
			sx={{
				width: "100%",
				padding: "2% 5%",
				bgcolor: theme.palette.primary.contrastText,
			}}
		>
			{data.map((item) => (
				<ListItem alignItems="flex-start" key={item._id}>
					{item._index === "dataset"
						? buildDatasetResult(item)
						: item._index === "file"
						? buildFileResult(item)
						: buildMetadataResult(item)}
				</ListItem>
			))}
		</List>
	);
}
