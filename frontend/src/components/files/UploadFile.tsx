import React, {useEffect, useState} from "react";

import {Box, Button, Stepper, Step, StepLabel, StepContent, Typography,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {UploadFileModal} from "./UploadFileModal";
import {CreateMetadata} from "../metadata/CreateMetadata";
import {fetchMetadataDefinitions, postFileMetadata} from "../../actions/metadata";
import {MetadataIn} from "../../openapi/v2";
import {useNavigate} from "react-router-dom";
import {fileCreated} from "../../actions/file";

type UploadFileProps ={
	selectedDatasetId: string|undefined,
	folderId: string|undefined,
	selectedDatasetName: string|undefined
}

export const UploadFile:React.FC<UploadFileProps> = (props: UploadFileProps) => {
	const {selectedDatasetId, folderId, selectedDatasetName} = props;

	const dispatch = useDispatch();
	// @ts-ignore
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const createFileMetadata = (fileId: string|undefined, metadata:MetadataIn) => dispatch(postFileMetadata(fileId, metadata));
	const uploadFile = (formData: FormData, selectedDatasetId: string|undefined) => dispatch(fileCreated(formData, selectedDatasetId));
	const newFile = useSelector((state:RootState) => state.dataset.newFile);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	const [fileRequestForm, setFileRequestForm] = useState({});
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	const history = useNavigate();

	// step 1
	const onFileSave = (formData:any) =>{
		setFileRequestForm(formData);
		handleNext();
	}
	// step 2
	const onMetadataSave = (contents:any) =>{
		setMetadataRequestForms(prevState => ({...prevState, [contents.definition]: contents}));
	}

	// step
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	}

	// finish button post dataset; dataset ID triggers metadata posting
	const handleFinish = () => {
		// create dataset
		setFileRequestForm(prevState => ({...prevState, "folder_id":folderId}))
		uploadFile(fileRequestForm, selectedDatasetId);
	}

	useEffect(() => {
		if (newFile.id) {
			// post new metadata
			Object.keys(metadataRequestForms).map(key => {
				createFileMetadata(newFile.id, metadataRequestForms[key]);
			});

			// Redirect to file route with file Id and dataset id
			history(`/files/${newFile.id}?dataset=${selectedDatasetId}&name=${selectedDatasetName}`);
			// TODO dispatch(resetFileUploaded());
		}

	},[newFile]);

	return (
		<Box sx={{padding: "5%"}}>
			<Stepper activeStep={activeStep} orientation="vertical">

				{/* step 1 attach files */}
				<Step key="attach-files">
					<StepLabel>Attach Files</StepLabel>
					<StepContent>
						<Typography>Upload files to the dataset.</Typography>
						<Box>
							<UploadFileModal onSave={onFileSave}/>
						</Box>
					</StepContent>
				</Step>

				{/*step 2 Metadata*/}
				<Step key="fill-in-metadata">
					<StepLabel>Fill In Metadata</StepLabel>
					<StepContent>
						<Typography>Provide us your metadata about file.</Typography>
						<Box>
							<CreateMetadata saveMetadata={onMetadataSave}/>
						</Box>
						{/*buttons*/}
						<Box sx={{ mb: 2 }}>
							<>
								<Button variant="contained" onClick={handleFinish} sx={{ mt: 1, mr: 1 }}>
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
	);
};
