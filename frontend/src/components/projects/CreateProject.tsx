import React, {useEffect, useState} from "react";

import {Box, Step, StepContent, StepLabel, Stepper, Typography,} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {projectCreated} from "../../actions/project";
import {useNavigate} from "react-router-dom";
import Layout from "../Layout";
import {ErrorModal} from "../errors/ErrorModal";
import {CreateProjectModal} from "./CreateProjectModal"

export const CreateProject = (): JSX.Element => {
	const dispatch = useDispatch();
	const createProject = (
		formData: FormData,
	) => dispatch(projectCreated(formData));

	const newProject = useSelector(
		(state: RootState) => state.project.newProject
	);

	const [errorOpen, setErrorOpen] = useState(false);

	const [projectRequestForm, setProjectRequestForm] = useState({});
	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	const history = useNavigate();

	const checkIfFieldsAreRequired = () => {
		const required = false;

		return required;
	};

	// step 1 - pick datasets
	const onProjectSave = (formData: any) => {
		setProjectRequestForm(formData);

		// If no metadata fields are marked as required, allow user to skip directly to submit
		if (checkIfFieldsAreRequired()) {
			setAllowSubmit(false);
		} else {
			setAllowSubmit(true);
		}

		handleNext();
	};
	// step 2 - add users

	// step
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleFinish = () => {
		createProject(projectRequestForm);
	};

	useEffect(() => {
		if (newProject && newProject.id) {
			history(`/projects/${newProject.id}`);
		}
	}, [newProject]);

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen}/>
				<Box className="inner-container">
					<Box>
						<Stepper activeStep={activeStep} orientation="vertical">
							{/*step 1 Dataset*/}
							<Step key="create-dataset">
								<StepLabel>Basic Information</StepLabel>
								<StepContent>
									<Typography>
										A project is a collection of datasets and a community of contributors.
									</Typography>
									<Box>
										<CreateProjectModal onSave={onProjectSave}/>
									</Box>
								</StepContent>
							</Step>

							<Step key="select-datasets">
								<StepLabel>Select Datasets</StepLabel>
								<StepContent>
									<Box />
								</StepContent>
							</Step>

							<Step key="invite-users">
								<StepLabel>Invite Users</StepLabel>
								<StepContent>
									<Box />
								</StepContent>
							</Step>
						</Stepper>
					</Box>
				</Box>
			</Box>
		</Layout>
	);
};
