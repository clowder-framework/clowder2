import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";
import { CopyToClipboard } from "react-copy-to-clipboard";

import React from "react";

type VisualizationShareProps = {
	presignedUrl: string;
	visShareModalOpen: boolean;
	setVisShareModalOpen: any;
};

export const VisualizationShareModal = (props: VisualizationShareProps) => {
	const { presignedUrl, visShareModalOpen, setVisShareModalOpen } = props;

	return (
		<Dialog
			open={visShareModalOpen}
			onClose={() => setVisShareModalOpen(false)}
			fullWidth={true}
		>
			<DialogTitle>Share Visualization</DialogTitle>
			<DialogContent>
				<ClowderFootnote>
					Copy and share the link below. Please note that the link will expire
					in 7 days.
				</ClowderFootnote>
				<ClowderMetadataTextField
					value={presignedUrl}
					disabled={true}
					fullWidth
				/>
			</DialogContent>
			<DialogActions>
				<CopyToClipboard text={presignedUrl}>
					<Button variant={"contained"}>Copy</Button>
				</CopyToClipboard>
				<Button onClick={() => setVisShareModalOpen(false)}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};
