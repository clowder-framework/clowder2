import React from "react";
import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField
} from "@mui/material";

import {ListenerInfo} from "./ListenerInfo";


export default function SubmitExtraction(props) {

	const {open, handleClose} = props;

	return (
		<Container>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle><ListenerInfo /></DialogTitle>
				<DialogContent>
					<DialogContentText>
						To subscribe to this website, please enter your email address here. We
						will send updates occasionally.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleClose}>Subscribe</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
