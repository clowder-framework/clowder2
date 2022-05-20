import React from "react";
import {Box, Typography} from "@mui/material";
import theme from "../../theme";

const textStyle = {
	fontWeight: "normal",
	fontSize: "10px",
	fontStyle: "italic",
	color: theme.palette.secondary.light,
};


export const Agent = (props) => {
	const {created, agent} = props;
	const id = `agent-${agent.id}`;

	return (
		<>
			<Box key={id}>
				<Typography sx={textStyle}>Created at: {created}</Typography>
				<Typography sx={textStyle}>Created by: {agent.creator.first_name} {agent.creator.last_name}</Typography>
			</Box>
		</>
	)
}
