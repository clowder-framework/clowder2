import * as React from "react";
import {Box, Link as MuiLink, List, ListItem, ListItemAvatar, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import DatasetIcon from "@mui/icons-material/Dataset";
import ArticleIcon from "@mui/icons-material/Article";
import {parseDate} from "../../utils/common";
import {theme} from "../../theme";

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

export function SearchResult(props) {

	const {data} = props;

	return (
		<List sx={{width: "100%", padding:"2% 5%", bgcolor: theme.palette.primary.contrastText}}>
			{data.map((item) => (
				<ListItem alignItems="flex-start" key={item._id}>
					<ListItemAvatar sx={{color: theme.palette.primary.main}}>
						{ item._index === "dataset" ? <DatasetIcon/> : <ArticleIcon /> }
					</ListItemAvatar>
					<Box sx={{marginTop:"5px"}}>
						{
							item._index === "dataset" ?
								<MuiLink component={Link} to={`/datasets/${item._id}`}
										 sx={{fontWeight: "bold", fontSize: "18px"}}>
									{parseString(item.name)}
								</MuiLink>
								:
								<MuiLink component={Link} to={`/files/${item._id}?dataset=${item.dataset_id}`}
										 sx={{fontWeight: "bold", fontSize: "18px"}}>
									{parseString(item.name)}
								</MuiLink>
						}
						<Typography variant="body2" color={theme.palette.secondary.light}>
							{
								item._index === "dataset" ?
									`Created by ${parseString(item.author)} at ${parseDate(item.created)}`
									:
									`Created by ${parseString(item.creator)} at ${parseDate(item.created)}`
							}
						</Typography>
						<Typography variant="body2" color={theme.palette.secondary.dark}>
							{item._index === "dataset" ? parseString(item.description) : `${item.content_type} | ${item.bytes} bytes`}
						</Typography>
					</Box>
				</ListItem>
			))}
		</List>
	);

}
