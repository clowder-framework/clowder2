import React, {useEffect, useState} from "react";

import {Box, Button, Container} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";

import fileSchema from "../../schema/fileSchema.json";
import {FormProps} from "@rjsf/core";
import {useDispatch, useSelector} from "react-redux";
import {fetchFileVersions, fileUpdated} from "../../actions/file";
import { fetchFileMetadata, postFileMetadata } from "../../actions/metadata";
import { RootState } from "../../types/data";
import { MetadataIn } from "../../openapi/v2";


type UpdateFileProps ={
	fileId: string|undefined,
	setOpen:(open:boolean) => void,
}

export const UpdateFile: React.FC<UpdateFileProps> = (props: UpdateFileProps) => {
	const dispatch = useDispatch();
	const updateFile = async (formData: FormData, fileId: string|undefined) => dispatch(fileUpdated(formData, fileId));
	const listFileVersions = (fileId: string | undefined) => dispatch(fetchFileVersions(fileId));
	const listFileMetadata = async (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const createFileMetadata = (fileId: string|undefined, metadata:MetadataIn) => dispatch(postFileMetadata(fileId, metadata));
	const fileMetadataList = useSelector((state: RootState) => state.metadata.fileMetadataList);

	const {fileId, setOpen,} = props;

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		listFileMetadata(fileId);
	}, []);

	const onSave = async (formData:FormData) => {
		setLoading(true);
		await updateFile(formData, fileId);

		// Update metadata entry for new version of file in db
		fileMetadataList.forEach((item, idx) => {
			if (item.definition !== null) {
				const metadata: MetadataIn = {
					context: item.context,
					context_url: item.context_url,
					content: item.content,
					definition: item.definition,
					file_version: item.resource.version + 1
				};

				createFileMetadata(fileId, metadata);
			}
		});

		setLoading(false);
		setOpen(false);
		listFileVersions(fileId);
	};

	// TODO
	// @ts-ignore
	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Form schema={fileSchema["schema"] as FormProps<any>["schema"]}
					  uiSchema={fileSchema["uiSchema"] as FormProps<any>["uiSchema"]}
					  onSubmit={({formData}) => {onSave(formData);}}>
					<Box className="inputGroup">
						<Button variant="contained" type="submit" className="form-button-block">Update</Button>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);

};
