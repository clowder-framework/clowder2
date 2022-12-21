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
import {Extractor} from "../../types/data";

type SubmitExtractionProps = {
	fileId: string,
	datasetId: string,
	open: boolean,
	handleClose: any,
	selectedExtractor: Extractor

}
export default function SubmitExtraction(props: SubmitExtractionProps) {


	const {fileId, datasetId, open, handleClose, selectedExtractor} = props;
	const dispatch = useDispatch();

	const submitFileExtraction =
		(fileId: string | undefined, extractorName: string | undefined, requestBody:FormData) => dispatch(submitFileExtractionAction(fileId, extractorName, requestBody));
	const submitDatasetExtraction =
		(datasetId: string | undefined, extractorName: string | undefined, requestBody:FormData) => dispatch(submitDatasetExtractionAction(datasetId, extractorName, requestBody));
	const onSubmit = (formData: FormData) => {
		const extractorName = selectedExtractor.name
		if (fileId === undefined && datasetId !== undefined) {
			submitDatasetExtraction(datasetId, extractorName, formData);
		} else if (fileId !== undefined) {
			submitFileExtraction(fileId, extractorName, formData);
		}
	}

	return (
		// TODO replace this with submit extraction content
		<Container>
			<Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
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
												className="form-button-block"
										>Submit</Button>
									</Box>
								</Form>
							</Container>
							:
							<Container>
								<Form
									schema={{"properties": {}}}
									onSubmit={({formData}) => {
										onSubmit(formData);
									}}>
									<Box className="inputGroup">
										<Button variant="contained" type="submit"
												className="form-button-block"
										>Submit</Button>
									</Box>
								</Form>
							</Container>
					}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
