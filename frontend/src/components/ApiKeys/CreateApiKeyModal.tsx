import React, { useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	MenuItem,
	Select,
} from "@mui/material";
import {
	generateApiKey as generateApiKeyAction,
	listApiKeys as listApiKeysAction,
	resetApiKey as resetApiKeyAction,
} from "../../actions/user";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ClowderInputLabel } from "../styledComponents/ClowderInputLabel";
import { ClowderInput } from "../styledComponents/ClowderInput";

type ApiKeyModalProps = {
	skip: number | undefined;
	limit: number;
	apiKeyModalOpen: boolean;
	setApiKeyModalOpen: any;
};

export const CreateApiKeyModal = (props: ApiKeyModalProps) => {
	const { skip, limit, apiKeyModalOpen, setApiKeyModalOpen } = props;

	const dispatch = useDispatch();
	const generateApiKey = (name: string, minutes: number) =>
		dispatch(generateApiKeyAction(name, minutes));
	const listApiKeys = (skip: number | undefined, limit: number | undefined) =>
		dispatch(listApiKeysAction(skip, limit));
	const resetApiKey = () => dispatch(resetApiKeyAction());
	const hashedKey = useSelector((state: RootState) => state.user.hashedKey);

	const [name, setName] = useState("");
	const [minutes, setMinutes] = useState(30);

	const handleClose = () => {
		setApiKeyModalOpen(false);

		// fetch latest api key list
		listApiKeys(skip, limit);
		resetApiKey();
		// reset
		setName("");
		setMinutes(30);
	};

	const handleGenerate = () => {
		generateApiKey(name, minutes);
	};

	const handleExpirationChange = (e) => {
		setMinutes(e.target.value);
	};

	return (
		<Dialog open={apiKeyModalOpen} onClose={handleClose} fullWidth={true}>
			<DialogTitle>Your API Key</DialogTitle>
			{hashedKey ? (
				<>
					<DialogContent>
						<ClowderFootnote>
							Make sure you copy your API key now as you will not be able to see
							this again.
						</ClowderFootnote>
						<ClowderMetadataTextField
							value={hashedKey}
							disabled={true}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<CopyToClipboard text={hashedKey}>
							<Button variant={"contained"}>Copy</Button>
						</CopyToClipboard>
						<Button onClick={handleClose}>Close</Button>
					</DialogActions>
				</>
			) : (
				<>
					<DialogContent>
						<FormControl fullWidth sx={{ marginTop: "1em" }}>
							<ClowderInputLabel>Name</ClowderInputLabel>
							<ClowderInput
								required={true}
								id="name"
								onChange={(event) => {
									setName(event.target.value);
								}}
								defaultValue={name}
							/>
						</FormControl>
						<FormControl fullWidth sx={{ marginTop: "1em" }}>
							<ClowderInputLabel id="expiration">
								Expire after
							</ClowderInputLabel>
							<Select
								labelId="expiration"
								id="expiration"
								value={minutes}
								label="After"
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
