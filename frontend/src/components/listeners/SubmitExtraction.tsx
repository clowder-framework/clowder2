import React from "react";
import {
	Box,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle
} from "@mui/material";

import {ListenerInfo} from "./ListenerInfo";
import Form from "@rjsf/material-ui";
import {FormProps} from "@rjsf/core";

type SubmitExtractionProps = {
	open: boolean,
	handleClose: any
	selectedExtractor: object
}
export default function SubmitExtraction(props: SubmitExtractionProps) {

	const {open, handleClose, selectedExtractor} = props;

	const onSubmit = (formData: FormProps<any>) => {
		console.log(formData);
	}

	return (
		// TODO replace this with submit extraction content
		<Container>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle><ListenerInfo/></DialogTitle>
				<DialogContent>
					<DialogContentText>
						Fill in the required extractor parameters
					</DialogContentText>
					{
						selectedExtractor &&
						selectedExtractor["properties"]
						&& selectedExtractor["properties"]["parameters"]
						&& selectedExtractor["properties"]["parameters"]["schema"] ?
							<Container>
								<Form
									schema={selectedExtractor["properties"]["parameters"]["schema"] as FormProps<any>["schema"]}
									// uiSchema={datasetSchema["uiSchema"] as FormProps<any>["uiSchema"]} // widgets={widgets}
									onSubmit={({formData}) => {
										onSubmit(formData);
									}}>
									<Box className="inputGroup">
										<Button variant="contained" type="submit"
												className="form-button-block">Submit</Button>
									</Box>
								</Form>
							</Container>
							: null
					}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleClose}>Subscribe</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
