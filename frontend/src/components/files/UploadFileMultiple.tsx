import React, { useEffect, useState } from "react";

import {
	Box,
	Button,
	Grid,
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";

import { UploadFileInput } from "./UploadFileInput";
import { CreateMetadata } from "../metadata/CreateMetadata";
import {
	fetchMetadataDefinitions,
	postFileMetadata,
} from "../../actions/metadata";
import { MetadataIn } from "../../openapi/v2";
import { useNavigate } from "react-router-dom";
import {
	createFile as createFileAction,
	createFiles as createFilesAction,
	resetFileCreated,
} from "../../actions/file";

import LoadingOverlay from "react-loading-overlay-ts";
import {UploadFileInputMultiple} from "./UploadFileInputMultiple";

type UploadFileMultipleProps = {
	selectedDatasetId: string | undefined;
	folderId: string | undefined;
	selectedDatasetName: string | undefined;
	multipleFilesFormData: FormData | undefined;
};

export const UploadFileMultiple: React.FC<UploadFileMultipleProps> = (
	props: UploadFileMultipleProps
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

	const uploadFiles = (
		selectedDatasetId: string | undefined,
		selectedFolderId: string | undefined,
		selectedFiles: FileList | undefined,
		multipleFilesFormData: FormData | undefined,
	) =>
		dispatch(
			createFilesAction(selectedDatasetId, selectedFolderId, selectedFiles, multipleFilesFormData)
		);
	const newFile = useSelector((state: RootState) => state.dataset.newFile);
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList
	);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedFiles, setSelectedFiles] = useState<FileList| null>(null);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allFilled, setAllFilled] = React.useState<boolean>(false);
	const [multipleFilesFormData, setMultipleFilesFormData] = React.useState(new FormData());
	const history = useNavigate();
	const checkIfFieldsAreRequired = () => {
		let required = false;

		metadataDefinitionList.forEach((val, _) => {
			if (val.fields[0].required) {
				required = true;
			}
		});

		return required;
	};

	const checkIfFieldsAreFilled = () => {
		return metadataDefinitionList.every((val) => {
			return val.fields.every((field) => {
				return field.required
					? metadataRequestForms[val.name] !== undefined &&
							metadataRequestForms[val.name].content[field.name] !==
								undefined &&
							metadataRequestForms[val.name].content[field.name] !== ""
					: true;
			});
		});
	};

	// step 1
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
	};

	useEffect(() => {
		if (Object.keys(metadataRequestForms).length > 0) {
			setAllFilled(checkIfFieldsAreFilled(metadataRequestForms));
		} else {
			setAllFilled(false);
		}
	}, [metadataRequestForms]);

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
		uploadFiles(selectedDatasetId, folderId, selectedFiles);
	};

	const handleFinishMultiple = () => {
		setLoading(true);
		uploadFiles(selectedDatasetId, folderId, selectedFiles, multipleFilesFormData);
	};

	useEffect(() => {
		console.log("we have a new file", newFile)
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
					{/*<Stepper activeStep={activeStep}>*/}
					{/*step 1 Metadata*/}
					<Step key="fill-in-metadata">
						<StepLabel>Fill In Metadata</StepLabel>
						<StepContent TransitionProps={{ unmountOnExit: false }}>
							<Typography>Provide us the metadata about your file.</Typography>
							<Box>
								<CreateMetadata setMetadata={setMetadata} />
							</Box>
							{/*buttons*/}
							<Grid container>
								<Grid xs={11}>
									<Button
										variant="contained"
										onClick={handleNext}
										disabled={!checkIfFieldsAreRequired() ? false : !allFilled}
										sx={{ display: "block", marginLeft: "auto" }}
									>
										Next
									</Button>
								</Grid>
								<Grid xs={1}></Grid>
							</Grid>
						</StepContent>
					</Step>
					{/* step 2 attach files */}
					<Step key="attach-files">
						<StepLabel>Attach Files</StepLabel>
						<StepContent TransitionProps={{ unmountOnExit: false }}>
							<Typography>Upload files to the dataset.</Typography>
							<Box>
								<UploadFileInputMultiple
									setSelectedFiles={setSelectedFiles}
									multipleFilesFormData={multipleFilesFormData}
								/>
								<Box className="inputGroup">
									<Button onClick={handleBack} sx={{ float: "right" }}>
										Back
									</Button>
									<Button
										variant="contained"
										onClick={handleFinishMultiple}
										disabled={!selectedFiles}
										sx={{ float: "right" }}
									>
										Finish
									</Button>
								</Box>
							</Box>
						</StepContent>
					</Step>
				</Stepper>
			</Box>
		</LoadingOverlay>
	);
};
