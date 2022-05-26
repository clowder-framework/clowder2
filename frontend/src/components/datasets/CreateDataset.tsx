import React, {useEffect, useState} from "react";

import {Box, Button, Stepper, Step, StepLabel, StepContent, Typography,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {CreateDatasetModal} from "./CreateDatasetModal";
import {CreateMetadata} from "../metadata/CreateMetadata";
import {UploadFile} from "../files/UploadFile";
import TopBar from "../navigation/TopBar";
import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import {fetchMetadataDefinitions, postDatasetMetadata} from "../../actions/metadata";
import {MetadataIn} from "../../openapi/v2";


export const CreateDataset = (): JSX.Element => {

	const dispatch = useDispatch();
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	// const createDatasetMetadata = (datasetId: string|undefined, metadata:MetadataIn) => dispatch(postDatasetMetadata(datasetId, metadata));
	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);
	const [datasetId, setDatasetId] = useState();

	const [datasetRequest, setdatasetRequest] = useState("");
	const [metadataRequests, setMetadataRequests] = useState([]);

	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason])
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = () => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	// step 1
	const onDatasetSave = (formData) =>{
		setdatasetRequest(formData);
		handleNext();
	}
	// step 2
	const onMetadataSave = (resourceId, contents) =>{
		setMetadataRequests(contents);
		// handleNext();
	}

	// step
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleSkip = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	}
	const handleFinish = () => {
		/// redirect to the dataset page
	}

	const steps = [
		{
			label: "Create Dataset",
			description: "",
			component: <CreateDatasetModal setDatasetId={setDatasetId} onSave={onDatasetSave}/>
		},
		{
			label: "Fill in Metadata",
			description: "",
			component: <CreateMetadata saveMetadata={onMetadataSave} resourceType="dataset" resourceId={datasetId}/>
		},
		{
			label: "Create Folders",
			description: "Users can create folders and subfolders inside dataset to help with file management.",
			component: <></>
		},
		{
			label: "Attach Files",
			description: "",
			component: <UploadFile />
		},
	];

	return (
		<>
			<TopBar/>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<Box className="inner-container">
					<Box>
						<Stepper activeStep={activeStep} orientation="vertical">
							{steps.map((step, index) => (
								<Step key={step.label}>
									<StepLabel
										optional={
											index === steps.length -1 ? (
												<Typography variant="caption">Last step</Typography>
											) : null
										}
									>
										{step.label}
									</StepLabel>
									<StepContent>
										<Typography>{step.description}</Typography>
										<Box>
											{step.component}
										</Box>
										{/*buttons*/}
										<Box sx={{ mb: 2 }}>
											<div>
												{index === steps.length - 1 ?

													<Button
														variant="contained"
														onClick={handleFinish}
														sx={{ mt: 1, mr: 1 }}
													>
														Finish
													</Button>
													:

													<Button
														variant="contained"
														onClick={handleNext}
														sx={{ mt: 1, mr: 1 }}
													>
														Next
													</Button>
												}
												{
													index === steps.length -1 || index === 0?
														null
														:
														<Button
															disabled={index === steps.length -1}
															onClick={handleSkip}
															sx={{ mt: 1, mr: 1 }}
														>
															Skip
														</Button>
												}
												{
													index === 0 ?
														null
														:
														<Button
															disabled={index === 0}
															onClick={handleBack}
															sx={{ mt: 1, mr: 1 }}
														>
															Back
														</Button>
												}
											</div>
										</Box>
									</StepContent>
								</Step>
							))}
						</Stepper>
					</Box>
				</Box>
			</Box>
		</>
	);
};
