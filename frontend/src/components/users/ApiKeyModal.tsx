import React, { useState } from "react";
import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";
import { generateApiKey as generateApiKeyAction } from "../../actions/user";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

type ApiKeyModalProps = {
	apiKeyModalOpen: boolean;
	setApiKeyModalOpen: any;
};

export const ApiKeyModal = (props: ApiKeyModalProps) => {
	const { apiKeyModalOpen, setApiKeyModalOpen } = props;

	const dispatch = useDispatch();
	const generateApiKey = (minutes: number) =>
		dispatch(generateApiKeyAction(minutes));
	const apiKey = useSelector((state: RootState) => state.user.apiKey);

	const [minutes, setMinutes] = useState(30);

	const handleClose = () => {
		setApiKeyModalOpen(false);
	};

	const handleGenerate = () => {
		generateApiKey(minutes);
	};

	const handleCopy = () => {};

	return (
		<Container>
			<Dialog open={apiKeyModalOpen} onClose={handleClose} fullWidth={true}>
				<DialogTitle>Your API Key</DialogTitle>

				{apiKey ? (
					<>
						<DialogContent>
							<ClowderMetadataTextField disabled={true}>
								{apiKey}
							</ClowderMetadataTextField>
						</DialogContent>
						<DialogActions>
							<Button variant={"contained"} onClick={handleGenerate}>
								Copy
							</Button>
							<Button onClick={handleClose}>Close</Button>
						</DialogActions>
					</>
				) : (
					<>
						<DialogContent>
							<FormControl fullWidth>
								<InputLabel variant="standard" id="expiration">
									Expire after
								</InputLabel>
								<Select
									labelId="expiration"
									id="expiration"
									value={minutes}
									defaultValue={30}
									label="expiration"
									onChange={(e) => {
										setMinutes(e.target.value);
									}}
								>
									<MenuItem value={30}>30 Minutes</MenuItem>
									<MenuItem value={60}>1 Hour</MenuItem>
									<MenuItem value={1440}>1 Day</MenuItem>
									<MenuItem value={10080}>1 Week</MenuItem>
									<MenuItem value={0}>Never</MenuItem>
								</Select>
							</FormControl>
						</DialogContent>
						<DialogActions>
							<Button variant={"contained"} onClick={handleGenerate}>
								Generate
							</Button>
							<Button onClick={handleClose}>Close</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</Container>
	);
};
