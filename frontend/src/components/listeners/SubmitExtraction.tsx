import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Box,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Step,
	StepContent,
	StepLabel,
	Stepper,
} from "@mui/material";

import { ListenerInfo } from "./ListenerInfo";
import Form from "@rjsf/material-ui";
import { FormProps } from "@rjsf/core";
import { submitFileExtractionAction } from "../../actions/file";
import { submitDatasetExtractionAction } from "../../actions/dataset";
import { Extractor, RootState } from "../../types/data";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import ExtractorStatus from "./ExtractorStatus";

type SubmitExtractionProps = {
	fileId: string;
	datasetId: string;
	open: boolean;
	handleClose: any;
	selectedExtractor: Extractor;
};

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

export default function SubmitExtraction(props: SubmitExtractionProps) {
	const { fileId, datasetId, open, handleClose, selectedExtractor } = props;
	const dispatch = useDispatch();

	const submitFileExtraction = (
		fileId: string | undefined,
		extractorName: string | undefined,
		requestBody: FormData
	) => dispatch(submitFileExtractionAction(fileId, extractorName, requestBody));
	const submitDatasetExtraction = (
		datasetId: string | undefined,
		extractorName: string | undefined,
		requestBody: FormData
	) =>
		dispatch(
			submitDatasetExtractionAction(datasetId, extractorName, requestBody)
		);

	const job_id = useSelector((state: RootState) => state.listener.currJobId);

	const onSubmit = (formData: FormData) => {
		const extractorName = selectedExtractor.name;
		if (fileId === undefined && datasetId !== undefined) {
			submitDatasetExtraction(datasetId, extractorName, formData);
			handleNext();
		} else if (fileId !== undefined) {
			submitFileExtraction(fileId, extractorName, formData);
			handleNext();
		}
	};

	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};
	const handleFinish = () => {
		setActiveStep(0);
	};
	const onClose = () => {
		handleClose();
		setActiveStep(0);
	};

	return (
		// TODO replace this with submit extraction content
		<Container>
			<Dialog
				open={open}
				onClose={onClose}
				fullWidth={true}
				maxWidth="md"
				sx={{
					".MuiPaper-root": {
						padding: "2em",
					},
				}}
			>
				<DialogTitle>
					<ListenerInfo selectedExtractor={selectedExtractor} />
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Stepper activeStep={activeStep} orientation="vertical">
						{/*step 1 fill in parameters and submit extractions*/}
						<Step key="submit">
							<StepLabel>Submit Extractions</StepLabel>
							<StepContent>
								{selectedExtractor &&
								selectedExtractor["properties"] &&
								selectedExtractor["properties"]["parameters"] &&
								selectedExtractor["properties"]["parameters"]["schema"] ? (
									<Container>
										<Form
											widgets={widgets}
											schema={{
												properties: selectedExtractor["properties"][
													"parameters"
												]["schema"] as FormProps<any>["schema"],
											}}
											onSubmit={({ formData }) => {
												onSubmit(formData);
											}}
										>
											<Box className="inputGroup">
												<Button
													variant="contained"
													type="submit"
													className="form-button-block"
												>
													Submit
												</Button>
											</Box>
										</Form>
									</Container>
								) : (
									<Container>
										<Form
											schema={{ properties: {} }}
											onSubmit={({ formData }) => {
												onSubmit(formData);
											}}
										>
											<Box className="inputGroup">
												<Button
													variant="contained"
													type="submit"
													className="form-button-block"
												>
													Submit
												</Button>
											</Box>
										</Form>
									</Container>
								)}
							</StepContent>
						</Step>
						{/*step 2 status*/}
						<Step key="status">
							<StepLabel>Extraction Status</StepLabel>
							<StepContent>
								<ExtractorStatus job_id={job_id} />
								{/*buttons*/}
								<Box sx={{ mb: 2 }}>
									<Button
										variant="contained"
										onClick={handleNext}
										sx={{ mt: 1, mr: 1 }}
									>
										Next
									</Button>
								</Box>
							</StepContent>
						</Step>
						{/*step 2 results*/}
						<Step key="results">
							<StepLabel>Extracted Results</StepLabel>
							<StepContent>
								{/*buttons*/}
								<Box sx={{ mb: 2 }}>
									<>
										<Button
											variant="contained"
											onClick={handleFinish}
											sx={{ mt: 1, mr: 1 }}
										>
											Restart
										</Button>
										<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
											Back
										</Button>
									</>
								</Box>
							</StepContent>
						</Step>
					</Stepper>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
