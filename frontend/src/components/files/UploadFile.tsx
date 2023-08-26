import React, { useEffect, useState } from "react";

import {
	Box,
	Button,
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";

import { UploadFileModal } from "./UploadFileModal";
import { CreateMetadata } from "../metadata/CreateMetadata";
import {
	fetchMetadataDefinitions,
	postFileMetadata,
} from "../../actions/metadata";
import { MetadataIn } from "../../openapi/v2";
import { useNavigate } from "react-router-dom";
import {
	createFile as createFileAction,
	resetFileCreated,
} from "../../actions/file";

import LoadingOverlay from "react-loading-overlay-ts";

type UploadFileProps = {
	selectedDatasetId: string | undefined;
	folderId: string | undefined;
	selectedDatasetName: string | undefined;
};

export const UploadFile: React.FC<UploadFileProps> = (
	props: UploadFileProps
) => {
	const { selectedDatasetId, folderId } = props;

	const [loading, setLoading] = useState(false);

	const dispatch = useDispatch();
	// @ts-ignore
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));
	const createFileMetadata = (
		fileId: string | undefined,
		metadata: MetadataIn
	) => dispatch(postFileMetadata(fileId, metadata));
	const uploadFile = (
		selectedDatasetId: string | undefined,
		selectedFolderId: string | undefined,
		selectedFile: File
	) =>
		dispatch(
			createFileAction(selectedDatasetId, selectedFolderId, selectedFile)
		);
	const newFile = useSelector((state: RootState) => state.dataset.newFile);
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList
	);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	const history = useNavigate();

	const checkIfFieldsAreRequired = () => {
		let required = false;

		metadataDefinitionList.forEach((val, idx) => {
			if (val.fields[0].required) {
				required = true;
			}
		});

		return required;
	};
	// step 1
	const onFileSave = (selectedFile: File) => {
		setSelectedFile(selectedFile);

		// If no metadata fields are marked as required, allow user to skip directly to submit
		if (checkIfFieldsAreRequired()) {
			setAllowSubmit(false);
		} else {
			setAllowSubmit(true);
		}

		handleNext();
	};
	// step 2
	const setMetadata = (metadata: any) => {
		// TODO wrap this in to a function
		setMetadataRequestForms((prevState) => {
			// merge the contents field; e.g. lat lon
			if (metadata.definition in prevState) {
				const prevContent = prevState[metadata.definition].content;
				metadata.content = { ...prevContent, ...metadata.content };
			}
			return { ...prevState, [metadata.definition]: metadata };
		});

		metadataDefinitionList.map((val, idx) => {
			if (val.fields[0].required) {
				// Condition checks whether the current updated field is a required one
				if (
					val.name == metadata.definition ||
					val.name in metadataRequestForms
				) {
					setAllowSubmit(true);
					return true;
				} else {
					setAllowSubmit(false);
					return false;
				}
			}
		});
	};

	// step
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	// finish button post dataset; dataset ID triggers metadata posting
	const handleFinish = () => {
		// Triggers spinner
		setLoading(true);

		// create dataset
		uploadFile(selectedDatasetId, folderId, selectedFile);
	};

	useEffect(() => {
		if (newFile.id) {
			// Stop spinner
			setLoading(false);

			// post new metadata
			const file = newFile;
			Object.keys(metadataRequestForms).map((key) => {
				createFileMetadata(file.id, metadataRequestForms[key]);
			});

			// reset newFile so next upload can be done
			dispatch(resetFileCreated());
			setMetadataRequestForms({});
			setSelectedFile(null);

			// Redirect to file route with file Id and dataset id
			history(
				`/files/${file.id}?dataset=${selectedDatasetId}&folder=${folderId}`
			);
		}
	}, [newFile]);

	return (
		<LoadingOverlay active={loading} spinner text="Uploading file...">
			<Box sx={{ padding: "5%" }}>
				<Stepper activeStep={activeStep} orientation="vertical">
					{/* step 1 attach files */}
					<Step key="attach-files">
						<StepLabel>Attach Files</StepLabel>
						<StepContent>
							<Typography>Upload files to the dataset.</Typography>
							<Box>
								<UploadFileModal onSave={onFileSave} />
							</Box>
						</StepContent>
					</Step>

					{/*step 2 Metadata*/}
					<Step key="fill-in-metadata">
						<StepLabel>Fill In Metadata</StepLabel>
						<StepContent>
							<Typography>Provide us your metadata about file.</Typography>
							<Box>
								<CreateMetadata setMetadata={setMetadata} />
							</Box>
							{/*buttons*/}
							<Box sx={{ mb: 2 }}>
								<>
									<Button
										variant="contained"
										onClick={handleFinish}
										disabled={!allowSubmit}
										sx={{ mt: 1, mr: 1 }}
									>
										Finish
									</Button>
									<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
										Back
									</Button>
								</>
							</Box>
						</StepContent>
					</Step>
				</Stepper>
			</Box>
		</LoadingOverlay>
	);
};
