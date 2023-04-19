import React, { useState } from "react";
import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Select,
} from "@mui/material";
import { generateApiKey as generateApiKeyAction } from "../../actions/user";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { ClowderButton } from "../styledComponents/ClowderButton";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

export default function ApiKey() {
	const dispatch = useDispatch();
	const generateApiKey = (minutes: number) =>
		dispatch(generateApiKeyAction(minutes));
	const apiKey = useSelector((state: RootState) => state.user.apiKey);

	const [open, setOpen] = useState(false);
	const [minutes, setMinutes] = useState(30);

	const handleClose = () => {
		setOpen(false);
	};

	const handleGenerate = () => {
		generateApiKey(minutes);
	};

	const handleCopy = () => {};

	return (
		<Container>
			<Dialog open={open} onClose={handleClose} fullWidth={true}>
				<DialogTitle>Your API Key</DialogTitle>
				<DialogContent>
					{apiKey ? (
						<>
							<ClowderMetadataTextField disabled={true}>
								{apiKey}
							</ClowderMetadataTextField>
							<ClowderButton onClick={handleGenerate}>
								Generate API Key
							</ClowderButton>
						</>
					) : (
						<>
							<Select
								labelId="demo-simple-select-label"
								id="simple-select"
								value={minutes}
								defaultValue={30}
								label="Status"
								onChange={(e) => {
									setMinutes(e.target.value);
								}}
							>
								<MenuItem value={30}>30 Minutes</MenuItem>
								<MenuItem value={60}>60 Minutes</MenuItem>
								<MenuItem value={1440}>1 Day</MenuItem>
								<MenuItem value={10080}>7 Days</MenuItem>
								<MenuItem value={0}>Never</MenuItem>
							</Select>
							<ClowderButton onClick={handleGenerate}>
								Generate API Key
							</ClowderButton>
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
