import React from "react";

import { Box, Button } from "@mui/material";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import { ClowderRjsfTextAreaWidget } from "../styledComponents/ClowderRjsfTextAreaWidget";

type CreateDatasetModalProps = {
	onSave: any;
};

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	TextAreaWidget: ClowderRjsfTextAreaWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = (
	props: CreateDatasetModalProps
) => {
	const { onSave } = props;

	return (
		<Form
			widgets={widgets}
			schema={datasetSchema["schema"] as FormProps<any>["schema"]}
			uiSchema={datasetSchema["uiSchema"] as FormProps<any>["uiSchema"]}
			onSubmit={({ formData }) => {
				onSave(formData);
			}}
			ErrorList={ClowderRjsfErrorList}
		>
			<Box className="inputGroup">
				<Button variant="contained" type="submit">
					Next
				</Button>
			</Box>
		</Form>
	);
};
