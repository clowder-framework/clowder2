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

type PresignedUrlShareProps = {
	presignedUrl: string;
	presignedUrlShareModalOpen: boolean;
	setPresignedUrlShareModalOpen: any;
};

export const PresignedUrlShareModal = (props: PresignedUrlShareProps) => {
	const {
		presignedUrl,
		presignedUrlShareModalOpen,
		setPresignedUrlShareModalOpen,
	} = props;

	return (
		<Dialog
			open={presignedUrlShareModalOpen}
			onClose={() => setPresignedUrlShareModalOpen(false)}
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
				<Button onClick={() => setPresignedUrlShareModalOpen(false)}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};
