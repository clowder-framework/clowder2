import React, {useEffect, useState} from "react";

import {Box, Button, Stepper, Step, StepLabel, StepContent, Typography,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {CreateDatasetModal} from "./CreateDatasetModal";
import {Metadata} from "../metadata/Metadata";
import {UploadFile} from "../files/UploadFile";
import TopBar from "../navigation/TopBar";
import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import {patchDatasetMetadata} from "../../actions/metadata";


export const CreateDataset = (): JSX.Element => {

	const dispatch = useDispatch();
	const updateDatasetMetadata = (datasetId: string | undefined, content:object) => dispatch(patchDatasetMetadata(datasetId,content));

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);
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

	const metadataDefinition = [
		{
			"id": "62865add66effac879a238fe",
			"name": "LatLon",
			"description": "A set of Latitude/Longitude coordinates",
			"context": {
				"longitude": "https://schema.org/longitude",
				"latitude": "https://schema.org/latitude"
			},
			"context_url": null,
			"fields": [
				{
					"id": "62865add66effac879a238ff",
					"name": "longitude",
					"type": "float",
					"list": false,
					"required": true
				},
				{
					"id": "62865add66effac879a23900",
					"name": "latitude",
					"type": "float",
					"list": false,
					"required": true
				}
			],
			"creator": {
				"id": "627a8d01ca3d2920a17f6025",
				"email": "cwang138@illinois.edu",
				"first_name": "Chen",
				"last_name": "Wang"
			}
		},
		{
			"id": "6286a71b459a0d00859323e5",
			"name": "AlternativeTitle",
			"description": "Alternative title",
			"context": {
				"title": "https://schema.org/alternateName"
			},
			"context_url": null,
			"fields": [
				{
					"id": "6286a71b459a0d00859323e6",
					"name": "alternateName",
					"type": "str",
					"list": false,
					"required": true
				}
			],
			"creator": {
				"id": "627a8d01ca3d2920a17f6025",
				"email": "cwang138@illinois.edu",
				"first_name": "Chen",
				"last_name": "Wang"
			}
		}
	];

	const steps = [
		{
			label: "Create Dataset",
			description: "",
			component: <CreateDatasetModal />
		},
		{
			label: "Fill in Metadata",
			description: "",
			// TODO how to port the datasetId in here
			component: <Metadata metadata={metadataDefinition}/>
			// component: <Metadata metadata={metadataDefinition} saveMetadata={createMetadata} resourceId={""}/>
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
