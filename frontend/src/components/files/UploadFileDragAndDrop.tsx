import React, {useEffect, useRef, useState} from "react";

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
import { FileDrop } from "react-file-drop";
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
import { UploadFileInputMultiple } from "./UploadFileInputMultiple";

type UploadFileDragAndDropProps = {
	selectedDatasetId: string | undefined;
	folderId: string | undefined;
};

import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";


const useStyles = makeStyles({
	fileDrop: {
		boxSizing: "border-box",
		height: "176px",
		width: "100%",
		border: "1px dashed #00619D",
		backgroundColor: "#FFFFFF",
		margin: "27px auto 0 auto",
		display: "block"
	},
	fileDropInput: {
		width: "95px"
	},
	fileDropText: {
		height: "54px",
		width: "92px",
		color: "#8798AD",
		fontSize: "15px",
		fontWeight: 500,
		letterSpacing: 0,
		lineHeight: "18px",
		textAlign: "center"
	},
	fileDropGroup: {
		width: "92px",
		margin: "50px auto 0 auto",
		display: "block"
	},
	displayFile: {
		boxSizing: "border-box",
		width: "100%",
		border: "1px solid #00619D",
		backgroundColor: "#FFFFFF",
		margin: "5px auto 0 auto",
		display: "block"
	},
	displayFileItem: {
		width: "100%",
		height: "37px"
	},
	displayFilename: {
		height: "18px",
		color: "#00619D",
		fontSize: "15px",
		fontWeight: 500,
		letterSpacing: 0,
		lineHeight: "18px",
		padding: "9px 17px",
		float: "left"
	},
	deleteFileIcon: {
		"height": "24px",
		"width": "24px",
		"float": "right",
		"margin": "6px",
		"&:hover": {
			color: "#D63649"
		}
	}
});


export const UploadFileDragAndDrop: React.FC<UploadFileDragAndDropProps> = (
	props: UploadFileDragAndDropProps
) => {
	const classes = useStyles();
	const { selectedDatasetId, folderId } = props;
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allFilled, setAllFilled] = React.useState<boolean>(false);

	const [loading, setLoading] = useState(false);

	// TODO some of this will need to change
	const fileInputRef = useRef(null);

	const onFileInputChange = (event) => {
		console.log('on file input change', event.target.files);
		const fileList = Array.from(event.target.files);
		setSelectedFiles(fileList);
	};
	const onDeleteClick = (filename) => {
		setSelectedFiles(selectedFiles.filter((file) => file.name !== filename));
	};
	const onDrop = (event) => {
		console.log('on drop', event);
		selectedFiles.push(event);
		console.log('on file input change', event.target.files);
		setSelectedFiles(Array.from(event.target.files));
	};



	// TODO end what is added from incore
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
			newFiles.map((file) => {
				// post new metadata
				Object.keys(metadataRequestForms).map((key) => {
					createFileMetadata(file.id, metadataRequestForms[key]);
				});
			});

			// reset newFile so next upload can be done
			dispatch(resetFilesCreated());
			setMetadataRequestForms({});

			// Stop spinner
			setLoading(false);

			// Redirect to the first file route with file Id and dataset id
			history(
				`/files/${newFiles[0].id}?dataset=${selectedDatasetId}&folder=${folderId}`
			);
		}
	}, [newFiles]);

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
								<CreateMetadata
									setMetadata={setMetadata}
									sourceItem={"files"}
								/>
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
								<Grid xs={1} />
							</Grid>
						</StepContent>
					</Step>
					{/* step 2 attach files */}
					<Step key="attach-files">
						<StepLabel>Attach Files</StepLabel>
						<StepContent TransitionProps={{ unmountOnExit: false }}>
							<Typography>Upload files to the dataset.</Typography>
							<Box>
								<FileDrop onDrop={onDrop} className={classes.fileDrop}>
									<div className={classes.fileDropGroup}>
										<input
											onChange={onFileInputChange}
											ref={fileInputRef}
											type="file"
											className={classes.fileDropInput}
											multiple
										/>
										<Typography className={classes.fileDropText}>
												Upload a File <br />
														or
											<br /> Drag & Drop
										</Typography>
									</div>
									{selectedFiles !== null && selectedFiles.length > 0 ? (
										<Box className={classes.displayFile}>
											{selectedFiles.map((file) => {
												return (
													<div className={classes.displayFileItem} key={file.name}>
														<Typography className={classes.displayFilename}>{file.name}</Typography>
														<IconButton
															aria-label="delete"
															className={classes.deleteFileIcon}
															onClick={() => {
																onDeleteClick(file.name);
															}}
														>
															<DeleteIcon />
														</IconButton>
													</div>
												);
											})}
										</Box>
									) : null}
								</FileDrop>
							</Box>
						</StepContent>
					</Step>
				</Stepper>
			</Box>
		</LoadingOverlay>
	);
};
