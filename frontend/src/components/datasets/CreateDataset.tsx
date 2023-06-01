import React, {useEffect, useState} from "react";

import {Box, Button, Step, StepContent, StepLabel, Stepper, Typography,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {CreateDatasetModal} from "./CreateDatasetModal";
import {CreateMetadata} from "../metadata/CreateMetadata";
import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import {fetchMetadataDefinitions, postDatasetMetadata} from "../../actions/metadata";
import {MetadataIn} from "../../openapi/v2";
import {datasetCreated, resetDatsetCreated} from "../../actions/dataset";
import {useNavigate} from "react-router-dom";
import Layout from "../Layout";


export const CreateDataset = (): JSX.Element => {

	const dispatch = useDispatch();
	// @ts-ignore
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const createDatasetMetadata = (datasetId: string|undefined, metadata:MetadataIn) => dispatch(postDatasetMetadata(datasetId, metadata));
	const createDataset = (formData: FormData) => dispatch(datasetCreated(formData));
	const newDataset = useSelector((state:RootState) => state.dataset.newDataset);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);

	const [datasetRequestForm, setdatasetRequestForm] = useState({});
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	const history = useNavigate();

	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason]);
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	};
	const handleErrorReport = () => {
		window.open(
			`${config.GHIssueBaseURL}+${encodeURIComponent(reason)}&body=${encodeURIComponent(stack)}`
		);
	};

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
	const onDatasetSave = (formData:any) =>{
		setdatasetRequestForm(formData);
        
		// If no metadata fields are marked as required, allow user to skip directly to submit
		if (checkIfFieldsAreRequired()) {
			setAllowSubmit(false);
        
		} else {
			setAllowSubmit(true);
		}

		handleNext();
	};
	// step 2
	const setMetadata = (metadata:any) =>{
		// TODO wrap this in to a function
		setMetadataRequestForms(prevState => {
			// merge the contents field; e.g. lat lon
			if (metadata.definition in prevState){
				const prevContent = prevState[metadata.definition].content;
				metadata.content = {...prevContent, ...metadata.content};
			}
			return ({...prevState, [metadata.definition]: metadata});
		});

		metadataDefinitionList.every((val, idx) => {
			if (val.fields[0].required) {
				// Condition checks whether the current updated field is a required one
				if (val.name == metadata.definition || val.name in metadataRequestForms) {
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
		// create dataset
		createDataset(datasetRequestForm);
	};

	useEffect(() => {
		if (newDataset.id) {
			// post new metadata
			Object.keys(metadataRequestForms).map(key => {
				createDatasetMetadata(newDataset.id, metadataRequestForms[key]);
			});

			//reset dataset so next creation can be done
			dispatch(resetDatsetCreated());
			setMetadataRequestForms({});
			setdatasetRequestForm({});

			// zoom into that newly created dataset
			history(`/datasets/${newDataset.id}`);
		}

	},[newDataset]);

	return (
		<Layout>
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
										<CreateMetadata setMetadata={setMetadata}/>
									</Box>
									{/*buttons*/}
									<Box sx={{ mb: 2 }}>
										<>
											<Button variant="contained" onClick={handleFinish} disabled={!allowSubmit} sx={{ mt: 1, mr: 1 }}>
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
		</Layout>
	);
};
