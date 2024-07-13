import React, { useEffect, useRef, useState } from "react";

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
import { CreateMetadata } from "../metadata/CreateMetadata";
import {
	fetchMetadataDefinitions,
	postFileMetadata,
} from "../../actions/metadata";
import { MetadataIn } from "../../openapi/v2";
import { useNavigate } from "react-router-dom";
import {
	createFiles as createFilesAction,
	resetFilesCreated,
} from "../../actions/file";

import LoadingOverlay from "react-loading-overlay-ts";
import FileUploadDrop from "./FileUploadDrop";

type UploadFileDragAndDropProps = {
	selectedDatasetId: string | undefined;
	folderId: string | undefined;
	setDragDropFiles: any;
};

export const UploadFileDragAndDrop: React.FC<UploadFileDragAndDropProps> = (
	props: UploadFileDragAndDropProps
) => {
	const { selectedDatasetId, folderId, setDragDropFiles } = props;
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allFilled, setAllFilled] = React.useState<boolean>(false);
	const fileInputRef = useRef(null);

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
	) => {
		dispatch(postFileMetadata(fileId, metadata));
	};

	const uploadFiles = (
		selectedDatasetId: string | undefined,
		selectedFiles: File[] | undefined,
		selectedFolderId: string | undefined
	) =>
		dispatch(
			createFilesAction(selectedDatasetId, selectedFiles, selectedFolderId)
		);

	const newFiles = useSelector((state: RootState) => state.dataset.newFiles);
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList.data
	);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	const history = useNavigate();
	const checkIfFieldsAreRequired = () => {
		let required = false;

		metadataDefinitionList.forEach((val, _) => {
			if (val.required_for_items.files && val.fields[0].required) {
				required = true;
			}
		});

		return required;
	};

	const onFileInputChange = (event) => {
		const fileList: File[] = Array.from(event.target.files);
		const newArray = selectedFiles.slice();
		fileList.forEach((f) => newArray.push(f));
		setSelectedFiles(newArray);
	};

	const onDrop = (fileList) => {
		const newFileList: File[] = Array.from(fileList);
		const newArray = selectedFiles.slice();
		newFileList.forEach((f) => newArray.push(f));
		setSelectedFiles(newArray);
	};

	const onDeleteClick = (element) => {
		const newFileList: File[] = selectedFiles;
		const newArray = newFileList.slice();
		newArray.pop(element);
		setSelectedFiles(newArray);
	};

	const checkIfFieldsAreFilled = () => {
		return metadataDefinitionList.every((val) => {
			return val.fields.every((field) => {
				return val.required_for_items.files && field.required
					? metadataRequestForms[val.name] !== undefined &&
							metadataRequestForms[val.name].content[field.name] !==
								undefined &&
							metadataRequestForms[val.name].content[field.name] !== ""
					: true;
			});
		});
	};

	const checkIfMetadataNeeded = () => {
		// This function checks if Step 1 to upload metadata is needed when users upload new file
		let required = false;

		metadataDefinitionList.forEach((val, _) => {
			if (val.required_for_items.files) {
				val.fields.forEach((field) => {
					if (field.required) {
						required = true;
						return;
					}
				});
			}
		});

		return required;
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

	const handleFinishMultiple = () => {
		setLoading(true);
		uploadFiles(selectedDatasetId, selectedFiles, folderId);
	};

	useEffect(() => {
		if (newFiles.length > 0) {
			newFiles.forEach((file) => {
				// post new metadata
				Object.keys(metadataRequestForms).forEach((key) => {
					createFileMetadata(file.id, metadataRequestForms[key]);
				});
			});

			// reset newFile so next upload can be done
			dispatch(resetFilesCreated());
			setMetadataRequestForms({});

			// Stop spinner
			setLoading(false);

			setDragDropFiles(false);
		}
	}, [newFiles]);

	return (
		<LoadingOverlay active={loading} spinner text="Uploading file...">
			<Box sx={{ padding: "5%" }}>
				<Stepper activeStep={activeStep} orientation="vertical">
					{/*<Stepper activeStep={activeStep}>*/}
					{/*step 1 Metadata*/}
					{checkIfMetadataNeeded() && (
						<Step key="fill-in-metadata">
							<StepLabel>Fill In Metadata</StepLabel>
							<StepContent TransitionProps={{ unmountOnExit: false }}>
								<Typography>
									Provide us the metadata about your file.
								</Typography>
								<Box>
									<CreateMetadata
										setMetadata={setAllFilled}
										sourceItem={"files"}
									/>
								</Box>
								<Grid container>
									<Grid item xs={11}>
										<Button
											variant="contained"
											onClick={handleNext}
											disabled={
												!checkIfFieldsAreRequired() ? false : !allFilled
											}
											sx={{ display: "block", marginLeft: "auto" }}
										>
											Next
										</Button>
									</Grid>
									<Grid item xs={1} />
								</Grid>
							</StepContent>
						</Step>
					)}
					{/* step 2 attach files */}
					<Step key="attach-files">
						<StepLabel>Attach Files</StepLabel>
						<StepContent TransitionProps={{ unmountOnExit: false }}>
							<Typography>Upload files to the dataset.</Typography>
							<Box>
								<FileUploadDrop
									onDrop={onDrop}
									onFileInputChange={onFileInputChange}
									fileInputRef={fileInputRef}
									onDeleteClick={onDeleteClick}
									selectedFiles={selectedFiles}
								/>
								<Box className="inputGroup">
									{checkIfMetadataNeeded() && (
										<Button onClick={handleBack} sx={{ float: "right" }}>
											Back
										</Button>
									)}
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
