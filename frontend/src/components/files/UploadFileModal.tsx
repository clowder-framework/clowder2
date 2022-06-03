import React from "react";

import {Box, Button, Container} from "@mui/material";
import Form from "@rjsf/material-ui";

import fileSchema from "../../schema/fileSchema.json";
import {FormProps} from "@rjsf/core";


type UploadFileModalProps ={
	onSave: any
}

export const UploadFileModal: React.FC<UploadFileModalProps> = (props: UploadFileModalProps) => {

	const {onSave} = props;

	// TODO
	// @ts-ignore
	return (
		<Container>
			<Form schema={fileSchema["schema"] as FormProps<any>["schema"]}
				  uiSchema={fileSchema["uiSchema"] as FormProps<any>["uiSchema"]}
				  onSubmit={({formData}) => {onSave(formData);}}>
				<Box className="inputGroup">
					<Button variant="contained" type="submit" className="form-button-block">Upload</Button>
				</Box>
			</Form>
		</Container>
	);

};
