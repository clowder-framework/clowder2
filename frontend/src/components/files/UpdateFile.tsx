import React, { useEffect, useState } from "react";

import { Box, Button, Container, Input } from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchFileVersions,
	updateFile as updateFileAction,
} from "../../actions/file";
import { fetchFileMetadata, postFileMetadata } from "../../actions/metadata";
import { RootState } from "../../types/data";
import { MetadataIn } from "../../openapi/v2";

type UpdateFileProps = {
	fileId: string | undefined;
	setOpen: (open: boolean) => void;
	setSelectedVersion: any;
};

export const UpdateFile: React.FC<UpdateFileProps> = (
	props: UpdateFileProps
) => {
	const dispatch = useDispatch();
	const updateFile = async (file: File, fileId: string | undefined) =>
		dispatch(updateFileAction(file, fileId));
	const listFileVersions = (fileId: string | undefined) =>
		dispatch(fetchFileVersions(fileId));
	const listFileMetadata = async (fileId: string | undefined) =>
		dispatch(fetchFileMetadata(fileId));
	const createFileMetadata = (
		fileId: string | undefined,
		metadata: MetadataIn
	) => dispatch(postFileMetadata(fileId, metadata));
	const fileMetadataList = useSelector(
		(state: RootState) => state.metadata.fileMetadataList
	);
	const fileVersions = useSelector(
		(state: RootState) => state.file.fileVersions
	);

	const { fileId, setOpen, setSelectedVersion } = props;

	const [loading, setLoading] = useState<boolean>(false);
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	useEffect(() => {
		listFileMetadata(fileId);
	}, []);

	const onSave = async (file: File) => {
		setLoading(true);
		// TODO: if this fails, the metadata update will also fail
		await updateFile(file, fileId);

		setLoading(false);
		setOpen(false);
		listFileVersions(fileId);
	};

	useEffect(() => {
		if (fileVersions.length > 0) {
			const latest = fileVersions[0]["version_num"];

			// Update metadata entry for new version of file in db
			fileMetadataList.forEach((item) => {
				if (item.definition !== null && item.resource.version < latest) {
					const metadata: MetadataIn = {
						context: item.context,
						context_url: item.context_url,
						content: item.content,
						definition: item.definition,
						file_version: item.resource.version + 1,
					};

					createFileMetadata(fileId, metadata);
				}
			});

			setSelectedVersion(latest);
		}
	}, [fileVersions]);

	// @ts-ignore
	return (
		<LoadingOverlay active={loading} spinner text="Saving...">
			<Container sx={{ width: "100%", padding: "1em" }}>
				<Input
					id="file-input"
					type="file"
					onChange={handleFileChange}
					sx={{ width: "100%" }}
				/>
				<Box className="inputGroup">
					<Button
						variant="contained"
						onClick={() => {
							onSave(selectedFile);
						}}
						disabled={!selectedFile}
					>
						Update
					</Button>
				</Box>
			</Container>
		</LoadingOverlay>
	);
};
