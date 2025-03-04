import React, {useEffect, useState} from "react";

import {Box, Typography,} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {useNavigate} from "react-router-dom";
import Layout from "../Layout";
import {ErrorModal} from "../errors/ErrorModal";
import projectSchema from "../../schema/projectSchema.json";
import {FormProps} from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import {ClowderRjsfTextWidget} from "../styledComponents/ClowderRjsfTextWidget";
import {ClowderRjsfTextAreaWidget} from "../styledComponents/ClowderRjsfTextAreaWidget";
import {ClowderRjsfSelectWidget} from "../styledComponents/ClowderRjsfSelectWidget";
import {projectCreated, resetProjectCreated} from "../../actions/project";


const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	TextAreaWidget: ClowderRjsfTextAreaWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

export const CreateProject = (): JSX.Element => {
	const dispatch = useDispatch();

	const newProject = useSelector(
		(state: RootState) => state.project.newProject
	);

	const [errorOpen, setErrorOpen] = useState(false);

	const history = useNavigate();

	const checkIfFieldsAreRequired = () => {
		const required = false;
		return required;
	};

	// step 1 - project details
	const saveProject = (formData: any) => {
		// If no metadata fields are marked as required, allow user to skip directly to submit
		if (!checkIfFieldsAreRequired()) {
			dispatch(projectCreated(formData));
		}
	};

	useEffect(() => {
		if (newProject && newProject.id) {
			dispatch(resetProjectCreated());
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
						<Typography>
							A project is a collection of datasets and a community of contributors.
						</Typography>
						<Box>
							<Form
								widgets={widgets}
								schema={projectSchema["schema"] as FormProps<any>["schema"]}
								uiSchema={projectSchema["uiSchema"] as FormProps<any>["uiSchema"]}
								validator={validator}
								onSubmit={({formData}) => {
									saveProject(formData);
								}}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		</Layout>
	);
};
