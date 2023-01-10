import React from "react";
import {Box, Typography} from "@mui/material";
import {theme} from "../../theme";
import {parseDate} from "../../utils/common";

const textStyle = {
	fontWeight: "normal",
	fontSize: "16x",
	fontStyle: "italic",
	color: theme.palette.secondary.light,
};


export const ListenerAgent = (props) => {
	const {created, agent} = props;
	const id = `agent-${agent.id}`;
	const listener = agent.listener;

	return (
		<>
			<Box key={id}>
				<Typography sx={textStyle}>Listener name: {agent.listener.name}</Typography>
				<Typography sx={textStyle}>Version: {agent.listener.version}</Typography>
				<Typography sx={textStyle}>Created at: {parseDate(created)}</Typography>
				<Typography sx={textStyle}>Created by: {agent.creator.first_name} {agent.creator.last_name}</Typography>
			</Box>
		</>
	)
}
