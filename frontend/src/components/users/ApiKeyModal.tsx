import React, { useState } from "react";
import {
	Button,
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
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
// import { CopyToClipboard } from "react-copy-to-clipboard";

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

	const handleExpirationChange = (e) => {
		setMinutes(e.target.value);
	};

	return (
		<Dialog open={apiKeyModalOpen} onClose={handleClose} fullWidth={true}>
			<DialogTitle>Your API Key</DialogTitle>
			{apiKey ? (
				<>
					<DialogContent>
						<ClowderFootnote>
							Make sure you copy your API key now as you will not be able to see
							this again.
						</ClowderFootnote>
						<ClowderMetadataTextField
							value={apiKey}
							disabled={true}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						{/*<CopyToClipboard text={}>*/}
						<Button variant={"contained"}>Copy</Button>
						{/*</CopyToClipboard>*/}
						<Button onClick={handleClose}>Close</Button>
					</DialogActions>
				</>
			) : (
				<>
					<DialogContent>
						<ClowderFootnote>Your API key will expire</ClowderFootnote>
						<FormControl fullWidth sx={{ marginTop: "1em" }}>
							<InputLabel id="demo-simple-select-label">After</InputLabel>
							<Select
								labelId="expiration"
								id="expiration"
								value={minutes}
								label="Expiration"
								onChange={handleExpirationChange}
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
	);
};
