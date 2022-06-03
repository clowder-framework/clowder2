import React from "react";

import {Box, Button, Container} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {FormProps} from "@rjsf/core";

type CreateDatasetModalProps = {
	onSave: any
}

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = (props:CreateDatasetModalProps) => {
	const {onSave} = props;

	return (
		<Container>
			<Form schema={datasetSchema["schema"] as FormProps<any>["schema"]}
				  uiSchema={datasetSchema["uiSchema"] as FormProps<any>["uiSchema"]} // widgets={widgets}
				  onSubmit={({formData}) => {onSave(formData);}}>
				<Box className="inputGroup">
					<Button variant="contained" type="submit" className="form-button-block">Create</Button>
				</Box>
			</Form>
		</Container>
	);
};
