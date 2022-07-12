import React, {useEffect, useState} from "react";

import {Box, Button, Stepper, Step, StepLabel, StepContent, Typography,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {CreateDatasetModal} from "./CreateDatasetModal";
import {CreateMetadata} from "../metadata/CreateMetadata";
import TopBar from "../navigation/TopBar";
import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason, resetLogout} from "../../actions/common";
import {fetchMetadataDefinitions, postDatasetMetadata} from "../../actions/metadata";
import {MetadataIn} from "../../openapi/v2";
import {datasetCreated, resetDatsetCreated} from "../../actions/dataset";
import {useNavigate} from "react-router-dom";


export const CreateDataset = (): JSX.Element => {

	const dispatch = useDispatch();
	// @ts-ignore
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const createDatasetMetadata = (datasetId: string|undefined, metadata:MetadataIn) => dispatch(postDatasetMetadata(datasetId, metadata));
	const createDataset = (formData: FormData) => dispatch(datasetCreated(formData));
	const newDataset = useSelector((state:RootState) => state.dataset.newDataset);

	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);
	const dismissLogout = () => dispatch(resetLogout());

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/auth/login");
		}
	}, [loggedOut]);

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);

	const [datasetRequestForm, setdatasetRequestForm] = useState({});
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	const history = useNavigate();

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
	const onDatasetSave = (formData:any) =>{
		setdatasetRequestForm(formData);
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
		createDataset(datasetRequestForm);
	}

	useEffect(() => {
		if (newDataset.id) {
			// post new metadata
			Object.keys(metadataRequestForms).map(key => {
				createDatasetMetadata(newDataset.id, metadataRequestForms[key]);
			});

			// zoom into that newly created dataset
			history(`/datasets/${newDataset.id}`);
			dispatch(resetDatsetCreated());
		}

	},[newDataset]);

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

							{/*step 1 Dataset*/}
							<Step key="create-dataset">
								<StepLabel>Create Dataset</StepLabel>
								<StepContent>
									<Typography>Create a dataset.</Typography>
									<Box>
										<CreateDatasetModal onSave={onDatasetSave}/>
									</Box>
								</StepContent>
							</Step>

							{/*step 2 Metadata*/}
							<Step key="fill-in-metadata">
								<StepLabel>Fill In Metadata</StepLabel>
								<StepContent>
									<Typography>Provide us your metadata about data.</Typography>
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
				</Box>
			</Box>
		</>
	);
};
