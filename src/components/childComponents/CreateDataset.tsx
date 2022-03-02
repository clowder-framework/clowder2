import React, {useEffect, useState} from "react";

import {Box, Button, Container} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {FormProps} from "@rjsf/core";
import {useDispatch, useSelector,} from "react-redux";
import {datasetCreated, resetDatsetCreated} from "../../actions/dataset";
import {RootState} from "../../types/data";
import {useNavigate} from "react-router-dom";


type CreateDatasetProps = {
	setOpen:(open:boolean) => void,
}

export const CreateDataset: React.FC<CreateDatasetProps> = (props: CreateDatasetProps) => {
	const history = useNavigate();

	const dispatch = useDispatch();
	const createDataset = (formData: FormData) => dispatch(datasetCreated(formData));
	const newDataset = useSelector((state:RootState) => state.dataset.newDataset);
	const {setOpen} = props;

	const [loading, setLoading] = useState(false);

	const onSave = async (formData:FormData) => {
		setLoading(true);
		createDataset(formData);
		setLoading(false);
		setOpen(false);
	};

	// zoom into that newly created dataset and reset newDataset
	useEffect(() => {
		if (newDataset !== undefined && newDataset.id !== undefined){
			history(`/datasets/${newDataset.id}`);
			dispatch(resetDatsetCreated());
		}
	}, [newDataset]);

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
