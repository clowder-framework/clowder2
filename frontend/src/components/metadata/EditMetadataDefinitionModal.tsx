import React, { useEffect, useState } from "react";
import Form from "@rjsf/material-ui";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {
	Autocomplete,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Grid,
	IconButton,
	MenuItem,
	Step,
	StepButton,
	StepContent,
	StepLabel,
	Stepper,
	Tooltip,
} from "@mui/material";
import { ClowderInput } from "../styledComponents/ClowderInput";
import Typography from "@mui/material/Typography";
import { contextUrlMap, InputType, widgetTypes } from "../../metadata.config";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { updateMetadataDefinition } from "../../actions/metadata";

interface SupportedInputs {
	[key: number]: Array<InputType>; // Define the type for SupportedInputs
}

type EditMetadataDefinitionModalProps = {
	setEditMetadataDefinitionOpen: any;
	metadataDefinitionId: string | undefined;
};

export default function EditMetadataDefinitionModal(
	props: EditMetadataDefinitionModalProps
) {
	const { setEditMetadataDefinitionOpen, metadataDefinitionId } = props;

	const dispatch = useDispatch();
	const editMetadataDefinition = (id: string | undefined, metadata: object) =>
		dispatch(updateMetadataDefinition(id, metadata));
	const metadataDefinition = useSelector(
		(state: RootState) => state.metadata.metadataDefinition
	);

	const [formInput, setFormInput] = React.useState(metadataDefinition);
	const [activeStep, setActiveStep] = React.useState(0);
	const [parsedInput, setParsedInput] = React.useState("");
	const [contextMap, setContextMap] = React.useState([{ term: "", iri: "" }]);
	const [supportedInputs, setSupportedInputs] = React.useState<SupportedInputs>(
		{ 0: [] }
	);

	// Update formData when metadataDefinitions or metdataDefinitionId changes
	useEffect(() => {
		if (metadataDefinition) {
			setFormInput(metadataDefinition);
			formInput.fields.map((field, idx) => {
				setSupportedInputs((prevState) => ({
					...prevState,
					[idx]: widgetTypes[field.widgetType]["input_types"],
				}));
			});
			if (metadataDefinition["@context"]) {
				const mappedContext = metadataDefinition["@context"].flatMap((obj) =>
					Object.entries(obj).map(([term, iri]) => ({ term, iri }))
				);
				setContextMap(mappedContext);
			}
		}
	}, [metadataDefinition]);

	const handleEditMetadataDefinition = () => {
		//@ts-ignore
		const data = JSON.parse(JSON.stringify(formInput));
		// let context = [JSON.parse(data.context)];
		// data.context = context;

		// Remove the options field if widgetType != enum
		for (let i = 0; i < data.fields.length; i++) {
			if (data.fields[i].config.type != "enum") {
				delete data.fields[i].config.options;
			}
		}
		// Handle form submission
		editMetadataDefinition(metadataDefinitionId, data);
		setEditMetadataDefinitionOpen(false);
	};
	const handleInputChange = (idx: number, key: string, value: string) => {
		const data = JSON.parse(JSON.stringify(formInput));
		// Handle input change of name, description, context high level fields
		if (idx == -1) {
			data[key] = value;
		} else {
			if (key == "list" || key == "required") {
				data["fields"][idx][key] = !data["fields"][idx][key];
			} else if (key == "type" || key == "options") {
				data["fields"][idx].config[key] = value;
			} else if (key == "name") {
				data["fields"][idx][key] = value;
			} else if (key == "widgetType") {
				data["fields"][idx][key] = value;
				// need reset type and list options
				data["fields"][idx].config["type"] = "";
				data["fields"][idx].config["options"] = "";
			}
		}

		setFormInput(data);
	};

	const handleMetadataRequiredInputChange = (key: string) => {
		const data = JSON.parse(JSON.stringify(formInput));

		if (key == "datasets")
			data.required_for_items.datasets = !data.required_for_items.datasets;
		else if (key == "files")
			data.required_for_items.files = !data.required_for_items.files;
		setFormInput(data);
	};

	const addNewContext = (idx: number) => {
		const newContextMap = [...contextMap];
		newContextMap.splice(idx + 1, 0, { term: "", iri: "" });

		setContextMap(newContextMap);
		constructContextJson(newContextMap);
	};

	const removeContext = (idx: number) => {
		if (contextMap.length == 1) {
			// Reset the context map if this is the last entry
			setContextMap([{ term: "", iri: "" }]);
			return;
		}
		const newContextMap = [...contextMap];
		newContextMap.splice(idx, 1);

		setContextMap(newContextMap);
		constructContextJson(newContextMap);
	};

	const updateContext = (idx: number, key: string, value: string | null) => {
		const currItem = contextMap[idx];
		const newContextMap = [...contextMap];

		if (key == "term") {
			newContextMap.splice(idx, 1, { term: value, iri: currItem.iri }); // Replaces item with new value inserted
		} else if (key == "iri") {
			newContextMap.splice(idx, 1, { term: currItem.term, iri: value });
		}

		setContextMap(newContextMap);
		constructContextJson(newContextMap);
	};

	const constructContextJson = (newContextMap: any) => {
		const data = JSON.parse(JSON.stringify(formInput));
		const contextJson = {};

		newContextMap.forEach((item, idx) => {
			contextJson[item["term"]] = item["iri"];
		});
		data["@context"] = [JSON.parse(JSON.stringify(contextJson))];
		setFormInput(data);
	};

	const addNewField = (idx: number) => {
		const newField = {
			name: "",
			list: false,
			widgetType: "",
			config: {
				type: "",
				options: "",
			},
			required: false,
		};

		const data = JSON.parse(JSON.stringify(formInput));
		const fields = data["fields"];

		// Add newfield to ith idx of list
		fields.splice(idx + 1, 0, newField);
		data.fields = fields;

		setFormInput(data);

		// Update the preview text
		parseInput();
	};

	const removeField = (idx: number) => {
		const data = JSON.parse(JSON.stringify(formInput));
		const fields = data["fields"];

		// if this is the last metadata entry, just reset it else delete the entry
		if (fields.length == 1)
			data.fields = [
				{
					name: "",
					list: false,
					widgetType: "",
					config: {
						type: "",
						options: "",
					},
					required: false,
				},
			];
		else {
			fields.splice(idx, 1);
			data.fields = fields;
		}

		setFormInput(data);

		// Update the preview text
		parseInput();

		// Render the stepper correctly after deleting a field
		handleBack();
	};

	const parseInput = () => {
		const data = JSON.parse(JSON.stringify(formInput));
		for (let i = 0; i < data.fields.length; i++) {
			if (data.fields[i].config.type != "enum") {
				delete data.fields[i].config.options;
			} else {
				const listOfOptions = data.fields[i].config.options.split(",");
				// Remove any trailing whitespace from each list entry
				listOfOptions.forEach(
					(value, index, arr) => (arr[index] = value.trim())
				);

				data.fields[i].config.options = listOfOptions;
			}
		}

		setParsedInput(JSON.stringify(data, null, 4));
	};

	const validateFormData = (stepNumber: number) => {
		let isFormValid = false;

		if (stepNumber == 0) {
			if (formInput.name !== "" && formInput.description != "") {
				// Validate context inputs are not empty
				isFormValid = true;

				contextMap.forEach((item) => {
					if (item.term == "" || item.iri == "") {
						isFormValid = false;
					}
				});
			}
		} else {
			const idx = stepNumber - 1;

			if (
				formInput.fields[idx].name !== "" &&
				formInput.fields[idx].widgetType != "" &&
				formInput.fields[idx].config.type != ""
			) {
				if (
					(formInput.fields[idx].config.type == "enum" &&
						formInput.fields[idx].config.options != "") ||
					formInput.fields[idx].config.type != "enum"
				) {
					isFormValid = true;
				}
			}
		}

		if (isFormValid) {
			handleNext();
			parseInput();
		}
	};

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	return (
		<div className="outer-container">
			<div className="inner-container">
				<Stepper activeStep={activeStep} orientation="vertical">
					<Step key="edit-metadata">
						<StepButton
							color="inherit"
							onClick={() => {
								setActiveStep(0);
							}}
						>
							Edit metadata definition*
						</StepButton>
						<StepContent>
							<form onSubmit={handleNext}>
								<ClowderInput
									margin="normal"
									required
									fullWidth
									id="name"
									label="Metadata Name"
									placeholder="Please enter metadata name"
									value={formInput["name"]}
									onChange={(event) => {
										handleInputChange(-1, "name", event.target.value);
									}}
								/>
								<ClowderInput
									margin="normal"
									required
									fullWidth
									id="metadata-description"
									label="Metadata Description"
									placeholder="Please enter metadata description"
									value={formInput.description}
									onChange={(event) => {
										handleInputChange(-1, "description", event.target.value);
									}}
								/>
								<FormGroup row>
									<Tooltip
										title="This will make the metadata as required when creating datasets or files"
										arrow
									>
										<Grid container alignItems="center">
											<Typography
												variant="subtitle1"
												style={{ marginRight: "10px" }}
											>
												Required:
											</Typography>
											<Grid item sm={6} md={4}>
												<FormControlLabel
													control={
														<Checkbox
															checked={formInput.required_for_items.datasets}
															onChange={() =>
																handleMetadataRequiredInputChange("datasets")
															}
														/>
													}
													label="Datasets"
												/>
												<FormControlLabel
													control={
														<Checkbox
															checked={formInput.required_for_items.files}
															onChange={() =>
																handleMetadataRequiredInputChange("files")
															}
														/>
													}
													label="Files"
												/>
											</Grid>
										</Grid>
									</Tooltip>
								</FormGroup>

								{contextMap.map((item, idx) => {
									return (
										<Grid container>
											<Grid item>
												<ClowderInput
													margin="normal"
													fullWidth
													required
													id="metadata-context"
													label="Term"
													placeholder="Please enter context term"
													value={item["term"]}
													sx={{
														mt: 1,
														mr: 1,
														alignItems: "right",
														width: "300px",
													}}
													onChange={(event) => {
														updateContext(idx, "term", event.target.value);
													}}
												/>
											</Grid>
											<Grid item>
												<Autocomplete
													id="metadata-auto-complete"
													freeSolo
													autoHighlight
													inputValue={item["iri"]}
													options={contextUrlMap["frequently_used"].map(
														(option) => option.url
													)}
													onInputChange={(event, value) => {
														updateContext(idx, "iri", value);
													}}
													renderInput={(params) => (
														<ClowderInput
															{...params}
															required
															label="IRI"
															fullWidth
														/>
													)}
													sx={{
														mt: 1,
														ml: 2,
														alignItems: "right",
														minWidth: "20em",
													}}
												/>
											</Grid>
											<IconButton
												color="primary"
												size="small"
												onClick={() => addNewContext(idx)}
											>
												<AddBoxIcon />
											</IconButton>
											<IconButton
												color="primary"
												size="small"
												onClick={() => removeContext(idx)}
											>
												<DeleteOutlineIcon />
											</IconButton>
										</Grid>
									);
								})}

								<Button
									variant="contained"
									onClick={() => validateFormData(activeStep)}
								>
									Next
								</Button>
							</form>
						</StepContent>
					</Step>

					{formInput.fields.map((input, idx) => {
						return (
							<Step key={idx}>
								<StepButton
									color="inherit"
									onClick={() => {
										setActiveStep(idx + 1);
									}}
								>
									<StepLabel>
										Edit metadata entry*
										{idx == activeStep - 1 ? (
											<>
												<IconButton
													color="primary"
													size="small"
													onClick={() => addNewField(idx)}
												>
													<AddBoxIcon />
												</IconButton>
												<IconButton
													size="small"
													onClick={() => removeField(idx)}
												>
													<DeleteOutlineIcon />
												</IconButton>
											</>
										) : (
											<></>
										)}
									</StepLabel>
								</StepButton>
								<StepContent>
									<Grid container>
										<Grid xs={4} md={4}>
											<FormGroup row>
												<FormControlLabel
													control={
														<Checkbox
															checked={input.list}
															onChange={(event) => {
																handleInputChange(
																	idx,
																	"list",
																	event.target.value
																);
															}}
														/>
													}
													label="Allow Many"
												/>
												<FormControlLabel
													control={
														<Checkbox
															checked={input.required}
															onChange={(event) => {
																handleInputChange(
																	idx,
																	"required",
																	event.target.value
																);
															}}
														/>
													}
													label="Required"
												/>
											</FormGroup>
										</Grid>
									</Grid>
									<ClowderInput
										margin="normal"
										required
										fullWidth
										id="field-name"
										label="Field Name"
										placeholder="Please enter field name"
										value={input.name}
										onChange={(event) => {
											handleInputChange(idx, "name", event.target.value);
										}}
									/>
									<ClowderInput
										margin="normal"
										required
										fullWidth
										id="widget-type-select-label"
										label="Widget Type"
										placeholder="Please enter metadata description"
										value={input.widgetType}
										onChange={(event) => {
											handleInputChange(idx, "widgetType", event.target.value);
											setSupportedInputs((prevState) => ({
												...prevState,
												[idx]: widgetTypes[event.target.value]["input_types"],
											}));
										}}
										helperText="Please select metadata widget type"
										select
									>
										{Object.keys(widgetTypes).map((key) => {
											return (
												<MenuItem
													value={widgetTypes[key]["name"]}
													key={widgetTypes[key]["name"]}
												>
													{widgetTypes[key]["description"]}
												</MenuItem>
											);
										})}
									</ClowderInput>
									<ClowderInput
										margin="normal"
										required
										fullWidth
										id="input-type-select-label"
										label="Field Data Type"
										value={input.config.type}
										onChange={(event) => {
											handleInputChange(idx, "type", event.target.value);
										}}
										helperText="Please select metadata field data type"
										select
									>
										{/*read the current selected widget idx and its supported types*/}
										{idx in supportedInputs
											? supportedInputs[idx].map((supportedInput) => {
													return (
														<MenuItem
															value={supportedInput["name"]}
															key={supportedInput["name"]}
														>
															{supportedInput["description"]}
														</MenuItem>
													);
											  })
											: null}
									</ClowderInput>
									{/*
									 * TODO: Expand to support different config data type actions
									 * https://github.com/clowder-framework/clowder2/issues/169
									 */}
									{input.config.type == "enum" ? (
										<>
											<ClowderInput
												margin="normal"
												required
												fullWidth
												id="options"
												label="Supported List Values"
												placeholder="Please enter list options delimited by comma"
												value={input.config.options}
												onChange={(event) => {
													handleInputChange(idx, "options", event.target.value);
												}}
												name="Field Data Options"
												multiline
												maxRows={6}
											/>
										</>
									) : (
										<></>
									)}
									<Button
										variant="contained"
										onClick={() => {
											validateFormData(activeStep);
										}}
									>
										Next
									</Button>
									<Button onClick={handleBack}>Back</Button>
								</StepContent>
							</Step>
						);
					})}
					<Step key="update">
						<StepLabel>Update</StepLabel>
						<StepContent>
							<ClowderInput disabled value={parsedInput} multiline fullWidth />
							<br />
							<Button
								variant="contained"
								onClick={handleEditMetadataDefinition}
								sx={{ mt: 1, mr: 1, alignItems: "right" }}
							>
								Update
							</Button>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</div>
	);
}
