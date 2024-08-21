import { Box, Typography } from "@mui/material";
import React from "react";
import Layout from "../Layout";
import Chat from "./Chat";

export const ChatPage = (): JSX.Element => {
	return (
		<Layout>
			<Box className="outer-container">
				<Box className="inner-container">
					<Typography variant="h4" gutterBottom>
						Chat
					</Typography>
					<Chat />
				</Box>
			</Box>
		</Layout>
	);
};
