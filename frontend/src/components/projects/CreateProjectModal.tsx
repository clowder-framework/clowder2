import React from "react";

import {Box, Button} from "@mui/material";

import Form from "@rjsf/mui";
import projectSchema from "../../schema/projectSchema.json";
import {FormProps} from "@rjsf/core";
import {ClowderRjsfTextWidget} from "../styledComponents/ClowderRjsfTextWidget";
import {ClowderRjsfSelectWidget} from "../styledComponents/ClowderRjsfSelectWidget";
import {ClowderRjsfTextAreaWidget} from "../styledComponents/ClowderRjsfTextAreaWidget";
import validator from "@rjsf/validator-ajv8";

type CreateProjectModalProps = {
	onSave: any;
};

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	TextAreaWidget: ClowderRjsfTextAreaWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = (
	props: CreateProjectModalProps
) => {
	const {onSave} = props;

	return (
		<Form
			widgets={widgets}
			schema={projectSchema["schema"] as FormProps<any>["schema"]}
			uiSchema={projectSchema["uiSchema"] as FormProps<any>["uiSchema"]}
			validator={validator}
			onSubmit={({formData}) => {
				onSave(formData);
			}}
		>
			<Box className="inputGroup">
				<Button variant="contained" type="submit">
					Next
				</Button>
			</Box>
		</Form>
	);
};
