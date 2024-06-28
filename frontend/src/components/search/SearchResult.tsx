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
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderIcon from "@mui/icons-material/Folder";
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
				<Typography variant="body2" color={theme.palette.info.main}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
				<Typography variant="body2" color={theme.palette.info.main}>
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
				<InsertDriveFileIcon />
			</ListItemAvatar>
			<Box sx={{ marginTop: "5px" }}>
				<MuiLink
					component={Link}
					to={`/files/${item._id}?dataset=${item.dataset_id}`}
					sx={{ fontWeight: "bold", fontSize: "18px" }}
				>
					{parseString(item.name)}
				</MuiLink>
				<Typography variant="body2" color={theme.palette.info.main}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
				<Typography variant="body2" color={theme.palette.info.main}>
					{`${item.content_type} | ${item.bytes} bytes`}
				</Typography>
			</Box>
		</>
	);
}

function buildFolderResult(item) {
	return (
		<>
			<ListItemAvatar sx={{ color: theme.palette.primary.main }}>
				<FolderIcon />
			</ListItemAvatar>
			<Box sx={{ marginTop: "5px" }}>
				<MuiLink
					component={Link}
					to={`/datasets/${item.dataset_id}?folder=${item._id}`}
					sx={{ fontWeight: "bold", fontSize: "18px" }}
				>
					{parseString(item.name)}
				</MuiLink>
				<Typography variant="body2" color={theme.palette.info.main}>
					Created by {parseString(item.creator)} at {parseDate(item.created)}
				</Typography>
			</Box>
		</>
	);
}

export function SearchResult(props) {
	const { data } = props;

	if (data.length > 0) {
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
						{item.resource_type === "dataset"
							? buildDatasetResult(item)
							: item.resource_type === "file"
							? buildFileResult(item)
							: item.resource_type === "folder"
							? buildFolderResult(item)
							: null}
					</ListItem>
				))}
			</List>
		);
	} else {
		return <></>;
	}
}
