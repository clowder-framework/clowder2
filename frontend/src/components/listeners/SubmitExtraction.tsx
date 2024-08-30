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
	IconButton,
	Step,
	StepContent,
	StepLabel,
	Stepper,
} from "@mui/material";

import { ListenerInfo } from "./ListenerInfo";
import Form from "@rjsf/mui";
import { FormProps } from "@rjsf/core";
import { submitFileExtractionAction } from "../../actions/file";
import { submitDatasetExtractionAction } from "../../actions/dataset";
import { RootState } from "../../types/data";
import { EventListenerOut as Extractor } from "../../openapi/v2";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import { ClowderFileSelector } from "../styledComponents/ClowderFileSelector";
import { ClowderImageAnnotator } from "../styledComponents/ClowderImageAnnotator";
import ExtractorStatus from "./ExtractorStatus";
import CloseIcon from "@mui/icons-material/Close";
import validator from "@rjsf/validator-ajv8";

type SubmitExtractionProps = {
	fileId: string;
	datasetId: string;
	open: boolean;
	infoOnly: boolean;
	handleClose: any;
	selectedExtractor: Extractor;
};

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	SelectWidget: ClowderRjsfSelectWidget,
	ClowderFile: ClowderFileSelector,
	ImageAnnotator: ClowderImageAnnotator,
};

export default function SubmitExtraction(props: SubmitExtractionProps) {
	const { fileId, datasetId, open, infoOnly, handleClose, selectedExtractor } =
		props;
	const dispatch = useDispatch();

	const uiSchema: any = {};

	const submitFileExtraction = (
		fileId: string | undefined,
		extractorName: string | undefined,
		datasetId: string | undefined,
		requestBody: FormData
	) =>
		dispatch(
			submitFileExtractionAction(fileId, extractorName, datasetId, requestBody)
		);
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
			submitFileExtraction(fileId, extractorName, datasetId, formData);
			handleNext();
		}
	};

	// The for loop is used to pass the datasetId to a widget if it is a ClowderFile Widget
	if (
		selectedExtractor &&
		selectedExtractor["properties"] &&
		selectedExtractor["properties"]["parameters"] &&
		selectedExtractor["properties"]["parameters"]["schema"]
	) {
		const parameters = selectedExtractor["properties"]["parameters"]["schema"];
		for (const key in parameters) {
			if (parameters[key].format) {
				switch (parameters[key].format) {
					case "ClowderFile":
						uiSchema[key] = {
							"ui:widget": "ClowderFile",
							"ui:options": {
								datasetId: datasetId,
							},
						};
						break;
					case "ImageAnnotator":
						uiSchema[key] = {
							"ui:widget": "ImageAnnotator",
							"ui:options": {
								fileId: fileId,
							},
						};
						break;
				}
			}
		}
	}

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
						height: "auto",
					},
				}}
			>
				<IconButton
					onClick={onClose}
					sx={{ width: "fit-content", margin: "auto 0 auto auto" }}
				>
					<CloseIcon />
				</IconButton>
				<DialogTitle>
					<ListenerInfo
						selectedExtractor={selectedExtractor}
						defaultExpanded={infoOnly}
					/>
				</DialogTitle>
				{!infoOnly ? (
					<>
						<Divider />
						<DialogContent sx={{ overflowY: "visible" }}>
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
													validator={validator}
													uiSchema={uiSchema}
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
													widgets={widgets}
													validator={validator}
													schema={{ properties: {} }}
													uiSchema={uiSchema}
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
									{/*<StepLabel>Extracted Results</StepLabel>*/}
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
					</>
				) : null}
			</Dialog>
		</Container>
	);
}
