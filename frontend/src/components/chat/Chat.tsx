// src/Chat.js
import React, { useState } from "react";
import {
	Box,
	TextField,
	IconButton,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export const Chat = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	const handleSend = () => {
		if (input.trim()) {
			setMessages([...messages, { text: input, sender: "User" }]);
			setInput("");
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "50vh",
				padding: 2,
			}}
		>
			<Paper sx={{ flex: 1, marginBottom: 2, overflow: "auto" }}>
				<List>
					{messages.map((message, index) => (
						<ListItem key={index}>
							<ListItemText primary={message.text} secondary={message.sender} />
						</ListItem>
					))}
				</List>
			</Paper>
			<Box sx={{ display: "flex" }}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Type a message..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							handleSend();
						}
					}}
				/>
				<IconButton color="primary" onClick={handleSend}>
					<SendIcon />
				</IconButton>
			</Box>
		</Box>
	);
};

export default Chat;
