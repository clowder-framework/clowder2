import React, {useState} from "react";

import {Box, Button, Container} from "@material-ui/core";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {createDataset} from "../../utils/dataset";
import {FormProps} from "@rjsf/core";

type CreateDatasetProps = {
	selectDataset: (selectedDatasetId: string) => void,
	setOpen:(open:boolean) => void,
}

export const CreateDataset: React.FC<CreateDatasetProps> = (props: CreateDatasetProps) => {
	const {selectDataset, setOpen} = props;

	const [loading, setLoading] = useState(false);

	const onSave = async (formData:FormData) => {
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
				<Form schema={datasetSchema["schema"] as FormProps<any>["schema"]}
					  uiSchema={datasetSchema["uiSchema"] as FormProps<any>["uiSchema"]} // widgets={widgets}
					  onSubmit={({formData}) => {onSave(formData);}}>
					<Box className="inputGroup">
						<Button variant="contained" type="submit" className="form-button-block">Create</Button>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);
};
