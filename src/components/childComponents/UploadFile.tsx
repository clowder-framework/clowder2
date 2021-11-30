import React, {useState} from "react";

import {Box, Button, Container} from "@material-ui/core";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";

import {uploadFile} from "../../utils/file.js";
import fileSchema from "../../schema/fileSchema.json";
import {FormProps} from "@rjsf/core";
import {useHistory} from "react-router-dom";


type UploadFileProps ={
	selectedDatasetId: string|undefined,
	setOpen:(open:boolean) => void,
}

export const UploadFile: React.FC<UploadFileProps> = (props: UploadFileProps) => {
	const history = useHistory();

	const {selectedDatasetId, setOpen,} = props;

	const [loading, setLoading] = useState<boolean>(false);


	const onSave = async (formData:FormData) => {
		setLoading(true);
		const response = await uploadFile(formData, selectedDatasetId);
		if (response !== {} && (response["id"] !== undefined || response["ids"] !== undefined)){
			// TODO once upload succeeded go to dataset page again
			// TODO if upload return full file object then we can use redux to update files
			// TODO but now it only returns id, so we have to "refresh" the dataset page to reflect
			history.go(0);
		}
		else{
			// TODO display error message to show upload unsuccess
			console.log("fail to upload files!");
		}
		setLoading(false);
		setOpen(false);
	};

	// TODO
	// @ts-ignore
	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Form schema={fileSchema["schema"] as FormProps<any>["schema"]}
					  uiSchema={fileSchema["uiSchema"] as FormProps<any>["uiSchema"]}
					  onSubmit={({formData}) => {onSave(formData);}}>
					<Box className="inputGroup">
						<Button variant="contained" type="submit" className="form-button-block">Upload</Button>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);

};
