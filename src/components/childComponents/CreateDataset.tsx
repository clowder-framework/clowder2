import React, {useState} from "react";

import {Box, Button, Container} from "@material-ui/core";

import LoadingOverlay from "react-loading-overlay";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {createDataset} from "../../utils/dataset";


export default function CreateDataset(props) {
	const {selectDataset, setOpen} = props;

	const [loading, setLoading] = useState(false);

	const onSave = async (formData) => {
		setLoading(true);
		const response = await createDataset(formData);
		if (response !== {} && response["id"] !== undefined){
			selectDataset(response["id"]);
		}
		setLoading(false);
		setOpen(false);
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Form schema={datasetSchema["schema"]} uiSchema={datasetSchema["uiSchema"]} // widgets={widgets}
					  onSubmit={({formData}, e) => {onSave(formData);}}>
					<Box className="inputGroup">
						<Button variant="contained" type="submit" className="form-button-block">Create</Button>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);
}
