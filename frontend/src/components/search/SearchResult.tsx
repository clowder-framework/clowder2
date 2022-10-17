import * as React from "react";
import {Link, List, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import {parseDate} from "../../utils/common";

export function SearchResult(props) {

	const {data} = props;

	return (
		<List sx={{width: "100%", padding:"2% 5%", bgcolor: "background.paper"}}>
			{data.map((item) => (
				<ListItem alignItems="flex-start">
					<ListItemAvatar>
						{ item._index === "dataset" ? <FolderIcon/> : <ArticleIcon /> }
					</ListItemAvatar>
					<ListItemText
						primary={
							<React.Fragment>
								{
									item._index === "dataset" ?
										<Link href={`/datasets/${item._id}`}>
											{item.name}
										</Link>
										:
										<Link href={`/datasets/${item._id}`}>
											{item.name}
										</Link>
								}
							</React.Fragment>
						}
						secondary={
							<React.Fragment>
								<Typography variant="body2" color="text.primary">
									{
										item._index === "dataset" ?
										`Created by ${item.author} at ${parseDate(item.created)}`
										:
										`Created by ${item.creator} at ${parseDate(item.created)}`
									}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{ item._index === "dataset" ? item.description : "" }
								</Typography>
								<Typography component="span" variant="caption" color="text.third">
									{/*replace with actual data type and bytes*/}
									{ item._index === "file" ? "application/json | 12345 bytes" : "" }
								</Typography>
							</React.Fragment>
						}
					/>
				</ListItem>
				))}
		</List>
	);

}
