import * as React from "react";
import {Link as MuiLink, List, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import DatasetIcon from "@mui/icons-material/Dataset";
import ArticleIcon from "@mui/icons-material/Article";
import {parseDate} from "../../utils/common";
import {theme} from "../../theme";

export function SearchResult(props) {

	const {data} = props;

	return (
		<List sx={{width: "100%", padding:"2% 5%", bgcolor: theme.palette.primary.contrastText}}>
			{data.map((item) => (
				<ListItem alignItems="flex-start">
					<ListItemAvatar sx={{color: theme.palette.primary.main}}>
						{ item._index === "dataset" ? <DatasetIcon/> : <ArticleIcon /> }
					</ListItemAvatar>
					<ListItemText
						primary={
							<React.Fragment>
								{
									item._index === "dataset" ?
										<MuiLink component={Link} to={`/datasets/${item._id}`}
											  sx={{ fontWeight: 600, fontSize: "18px"}}>
											{item.name}
										</MuiLink>
										:
										<MuiLink component={Link} to={`/files/${item._id}?dataset=${item.dataset_id}`}
											  sx={{ fontWeight: 600, fontSize: "18px"}}>
											{item.name}
										</MuiLink>
								}
							</React.Fragment>
						}
						secondary={
							<React.Fragment>
								<Typography variant="body2" color={theme.palette.secondary.light}>
									{
										item._index === "dataset" ?
										`Created by ${item.author} at ${parseDate(item.created)}`
										:
										`Created by ${item.creator} at ${parseDate(item.created)}`
									}
								</Typography>
								<Typography variant="body2" color={theme.palette.secondary.dark}>
									{ item._index === "dataset" ? item.description : `${item.content_type} | ${item.bytes} bytes`}
								</Typography>
							</React.Fragment>
						}
					/>
				</ListItem>
				))}
		</List>
	);

}
