import React, {useEffect, useState} from "react";

import {Button, Checkbox, Grid, TextField, Step, StepContent, StepLabel, Stepper, FormControl, Select, MenuItem, InputLabel, FormGroup, FormControlLabel, IconButton} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { postMetadataDefinitions } from "../../actions/metadata";
import Layout from "../Layout";

export const CreateMetadataDefinitionPage = (): JSX.Element => {
	return (
		<Layout>
			<CreateMetadataDefinition/>
		</Layout>
	);
}
const widgetTypes = ['TextField', 'DateTimePicker', 'Select'];

export const CreateMetadataDefinition = (): JSX.Element => {

	const dispatch = useDispatch();
	// @ts-ignore
	const saveMetadataDefinitions = (metadata: object) => dispatch(postMetadataDefinitions(metadata));
	
	const [activeStep, setActiveStep] = React.useState(0);
	const [formInput, setFormInput] = React.useState({
		metadataName: "",
		metadataDescription: "",
		context: "https://schema.org/",
		fields: [{
			name: "",
			list: false,
			widgetType: "",
			config: {
				type: "",
				options: ""
			},
			required: false,
		}]
	})

	const handleInputChange = (index: number, key: string, value: string) => {
		let data = {...formInput}

		if (key == "metadataName" || key == "metadataDescription" || key == "context") {
			data[key] = value
		
		} else {
			if (key == "list" || key == "required") {
				data["fields"][index][key] = !data["fields"][index][key]
			
			} else if (key == "type" || key == "options") {
				data["fields"][index].config[key] = value
			
			} else if (key == "name" || key == "widgetType") {
				data["fields"][index][key] = value
			}
		}

		setFormInput(data)
	}

	const addNewField = (index: number) => {
		let newitem = {
			name: "",
			list: false,
			widgetType: "",
			config: {
				type: "",
				options: ""
			},
			required: false,
		}

		let newfield = formInput["fields"]
		
		// Add newfield to ith index of list
		newfield.splice(index + 1, 0, newitem)

		setFormInput({
			metadataName: formInput.metadataName,
			metadataDescription: formInput.metadataDescription,
			context: formInput.context,
			fields: newfield
		})
	}

	const removeField = (index: number) => {
		let data = formInput["fields"]
		data.splice(index, 1)

		setFormInput({
			metadataName: formInput.metadataName,
			metadataDescription: formInput.metadataDescription,
			context: formInput.context,
			fields: data
		})
	}

    const postMetadata = () => {
		// First check if the input is valid
		if (formInput.metadataName != "" && formInput.metadataDescription != "" && formInput.context != "") {
			// Invoke post request
			saveMetadataDefinitions(formInput);
					
			// Reset form
			clearForm();
		}
	}

	const clearForm = () => {
		// Reset stepper
		setActiveStep(0);

		// Reset state
		setFormInput({
			metadataName: "",
			metadataDescription: "",
			context: "https://schema.org/",
			fields: [{
				name: "",
				list: false,
				widgetType: "",
				config: {
					type: "",
					options: ""
				},
				required: false,
			}]
		})
	}

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
					<Step key="create-metadata">
						<StepLabel>Create Metadata Definition*</StepLabel>
						<StepContent>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								autoFocus
								id="metadataName"
								label="Metadata Name"
								placeholder="Please enter metadata name"
								value={formInput["metadataName"]}
								onChange={(event) => { handleInputChange(0, "metadataName", event.target.value); }}
							/>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="metadata-description"
								label="Metadata Description"
								placeholder="Please enter metadata description"
								value={formInput.metadataDescription}
								onChange={(event) => { handleInputChange(0, "metadataDescription", event.target.value); }}
							/>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="metadata-context"
								label="Metadata Context"
								placeholder="Please enter metadata context"
								value={formInput.context}
								onChange={(event) => { handleInputChange(0, "context", event.target.value); }}
							/>
							<Button variant="contained" onClick={handleNext}>Next</Button>
						</StepContent>
					</Step>

					{formInput.fields.map((input, index) => {
						return (<Step key={index}>
								{index == 0 ? 
									<StepLabel>Add metadata entry*
										{index == activeStep - 1 ? 
										<IconButton color="primary" size="small" onClick={() => addNewField(index)}>
											<AddBoxIcon />
										</IconButton>
										: <></>}
									</StepLabel>
								:
									<StepLabel>Add additional entry
										{index == activeStep - 1 ? 
										<>
											<IconButton color="primary" size="small" onClick={() => addNewField(index)}>
												<AddBoxIcon />
											</IconButton>
											<IconButton color="primary" size="small" onClick={() => removeField(index)}>
												<DeleteOutlineIcon />
											</IconButton>
										</>
										: 
										<IconButton size="small" onClick={() => removeField(index)}>
											<DeleteOutlineIcon />
										</IconButton>}
									</StepLabel>
								}
								<StepContent>
									<Grid container>
										<Grid xs={4} md={4}>
											<FormGroup>
												<FormControlLabel control={<Checkbox 
													checked={input.list}
													onChange={(event) => { handleInputChange(index, "list", event.target.value); }}
													/>} label="Contains List" />
												<FormControlLabel control={<Checkbox 
													checked={input.required}
													onChange={(event) => { handleInputChange(index, "required", event.target.value); }}
													/>} label="Required" />
											</FormGroup>
										</Grid>
									</Grid>
									<TextField
										variant="outlined"
										margin="normal"
										required
										fullWidth
										id="field-name"
										label="Field Name"
										placeholder="Please enter field name"
										value={input.name}
										onChange={(event) => { handleInputChange(index, "name", event.target.value); }}
									/>
									<FormControl fullWidth>
										<InputLabel id="widget-type-select">Select Widget Type</InputLabel>
										<Select
											labelId="widget-type-select-label"
											id="widget-type-select-label"
											value={input.widgetType}
											onChange={(event) => { handleInputChange(index, "widgetType", event.target.value); }}
											label="widgetType">
											{widgetTypes.map((input, index) => {
												return (
													<MenuItem value={input}>{input}</MenuItem>
												);
											})}
										</Select>
									</FormControl>
									<TextField
										variant="outlined"
										margin="normal"
										required
										fullWidth
										id="datatype"
										label="Field Data Type"
										placeholder="Please enter field data type (e.g. int, str, enum)"
										name="Field Data Type"
										value={input.config.type}
										onChange={(event) => { handleInputChange(index, "type", event.target.value); }}
									/>
									{(input.config.type == "enum") ? <>
										<TextField
											variant="outlined"
											margin="normal"
											required
											fullWidth
											id="options"
											label="options"
											name="Field Data Options"
											multiline
											maxRows={6}
										/>
									</> : <></>}
									{index != formInput.fields.length - 1 ? <Button  variant="contained" onClick={handleNext}>Next</Button> : <Button  variant="contained" onClick={handleNext}>Finish</Button> }
									<Button onClick={handleBack}>Back</Button>
								</StepContent>
							</Step>
						);
					})}
					
					<Step key="submit">
						<StepLabel>Submit</StepLabel>
						<StepContent>
							<Button
								variant="contained"
								onClick={postMetadata}
								sx={{ mt: 1, mr: 1, "alignItems": "right" }}>
								Submit
							</Button>
							<Button
								onClick={clearForm}
								sx={{ mt: 1, mr: 1, "alignItems": "right" }}>
								Clear
							</Button>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</div>
	);
};
