import React from "react";
import {useDispatch} from "react-redux";
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
import {submitFileExtractionAction} from "../../actions/file";
import {submitDatasetExtractionAction} from "../../actions/dataset";

type SubmitExtractionProps = {
	fileId: string,
	datasetId: string,
	open: boolean,
	handleClose: any,
	selectedExtractor: object

}
export default function SubmitExtraction(props: SubmitExtractionProps) {


	const {fileId, datasetId, open, handleClose, selectedExtractor} = props;
	const dispatch = useDispatch();

	const submitFileExtraction = (fileId: string | undefined, extractor: string | undefined) => dispatch(submitFileExtractionAction(fileId, extractor));
	const submitDatasetExtraction = (datasetId: string | undefined, extractor: string | undefined) => dispatch(submitDatasetExtractionAction(datasetId, extractor));
	const onSubmit = (formData: FormProps<any>, ) => {
		console.log(formData);
		console.log(selectedExtractor);
		console.log('values')
		// TODO send parameters here
		if (fileId === undefined && datasetId !== undefined) {
			console.log('file id is undefined');
		} else if (fileId !== undefined) {
			console.log("We have a file");
		}

		// TODO submit here using method that submits extractor

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
									schema={{"properties": selectedExtractor["properties"]["parameters"]["schema"] as FormProps<any>["schema"]}}
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
