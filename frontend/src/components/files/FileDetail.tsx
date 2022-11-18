import React from "react";
import {Box, Stack, Typography} from "@mui/material";
import {parseDate} from "../../utils/common";
import {FileOut} from "../../openapi/v2";
import prettyBytes from "pretty-bytes";


type FileAboutProps = {
	fileSummary: FileOut
}

export function FileDetail(props: FileAboutProps) {
	const {id, created, name, creator, version_id, bytes, content_type, views, downloads} = props.fileSummary;

	return (
		<Box>
			<Box sx={{mt: 5}}>
				<Typography variant="h5" gutterBottom>Details</Typography>
				<Stack spacing={2}>
					<Box>
						<Typography>{prettyBytes(bytes)}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Size</Typography>
					</Box>
					<Box>
						<Typography>{content_type}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Content Type</Typography>
					</Box>
					<Box>
						<Typography>{parseDate(created)}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Updated on</Typography>
					</Box>
					<Box>
						<Typography>{name}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Uploaded as</Typography>
					</Box>
					<Box>
						<Typography>{creator.first_name} {creator.last_name}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Uploaded by</Typography>
					</Box>
					<Box>
						<Typography>{id}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>File id</Typography>
					</Box>
				</Stack>
			</Box>
			<Box sx={{mt: 5}}>
				<Typography variant="h5" gutterBottom>Statistics</Typography>
				<Stack spacing={2}>
					<Box>
						<Typography>{views}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Views</Typography>
					</Box>
					<Box>
						<Typography>{downloads}</Typography>
						<Typography variant="caption" sx={{color: 'text.secondary'}}>Downloads</Typography>
					</Box>
				</Stack>
			</Box>
		</Box>
	)
}

