import React from "react";

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
	TextField
} from "@mui/material";
import {useDispatch,} from "react-redux";
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {postMetadataDefinitions} from "../../actions/metadata";
import Layout from "../Layout";

import {contextUrlMap, inputTypes, widgetTypes} from "../../metadata.config";

export const CreateMetadataDefinitionPage = (): JSX.Element => {
	return (
		<Layout>
			<CreateMetadataDefinition/>
		</Layout>
	);
}

export const CreateMetadataDefinition = (): JSX.Element => {

	const dispatch = useDispatch();
	// @ts-ignore
	const saveMetadataDefinitions = (metadata: object) => dispatch(postMetadataDefinitions(metadata));

	const [activeStep, setActiveStep] = React.useState(0);
	const [parsedInput, setParsedInput] = React.useState("");
	const [contextMap, setContextMap] = React.useState([{"context_name": "", "context_val": ""}]);
	const [formInput, setFormInput] = React.useState({
		name: "",
		description: "",
		context: '{\n\t"abstract": "http://purl.org/dc/terms/abstract"\n}',
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

	const handleInputChange = (idx: number, key: string, value: string) => {
		let data = {...formInput}

		// Handle input change of name, description, context high level fields
		if (idx == -1) {
			data[key] = value

		} else {
			if (key == "list" || key == "required") {
				data["fields"][idx][key] = !data["fields"][idx][key]

			} else if (key == "type" || key == "options") {
				data["fields"][idx].config[key] = value

			} else if (key == "name" || key == "widgetType") {
				data["fields"][idx][key] = value
			}
		}

		setFormInput(data)
	}

    const addNewContext = (idx: number) => {
        setContextMap(
            [...contextMap, {"context_name": "", "context_val": ""}]
        )
    }

    const removeContext = (idx: number) => {
        setContextMap(
            contextMap.splice(idx)
        )
    }

    const updateContext = (idx: number, key: String, value: String) => {
        if (key == 'name') {
            let newContextMap = [...contextMap]
            // TODO: Test below code
            // contextMap.map((item, index) => {
            //     var temp = Object.assign({}, item)
            //     if (index == idx) {
            //         temp["context_name"] = value
            //     }
            //     return temp
            // })

            setContextMap(newContextMap)
        }
    }

	const addNewField = (idx: number) => {
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

		// Add newfield to ith idx of list
		newfield.splice(idx + 1, 0, newitem)

		setFormInput({
			name: formInput.name,
			description: formInput.description,
			context: formInput.context,
			fields: newfield
		})

		// Update the preview text
		parseInput()
	}

	const removeField = (idx: number) => {
		let data = formInput["fields"]
		data.splice(idx, 1)

		setFormInput({
			name: formInput.name,
			description: formInput.description,
			context: formInput.context,
			fields: data
		})

		// Update the preview text
		parseInput()

		// Render the stepper correctly after deleting a field
		handleBack()
	}

	const postMetadata = () => {
		// Parse the context
		let context = JSON.parse(formInput.context)
		formInput.context = context

		// Remove the options field if widgetType != enum
		for (let i = 0; i < formInput.fields.length; i++) {
            if (formInput.fields[i].config.type != "enum") {
				delete formInput.fields[i].config.options
			}
		}

		// Invoke post request
		saveMetadataDefinitions(formInput);

		// Reset form
		clearForm();
	}

	const parseInput = () => {
		let data = {...formInput}

		// Parse the context JSON
		data.context = JSON.parse(data.context)

		// Remove the options field if widgetType != enum
		for (let i = 0; i < data.fields.length; i++) {
			if (data.fields[i].config.type != "enum") {
				delete data.fields[i].config.options
			} else {
				let listOfOptions = data.fields[i].config.options.split(",")
                // Remove any trailing whitespace from each list entry
                listOfOptions.forEach((value, index, arr) => arr[index] = value.trim())

				data.fields[i].config.options = listOfOptions
			}
		}

		setParsedInput(JSON.stringify(data, null, 4))
	}

	const validateFormData = (stepNumber: number) => {
		let isFormValid = false

		if (stepNumber == 0) {
			if (formInput.name !== "" && formInput.description != "") {
				// Validate JSON string schema
				try {
					let jsonString = JSON.parse(formInput.context)
					isFormValid = true

				} catch (error) {
					isFormValid = false
				}
			}

		} else {
			let idx = stepNumber - 1

			if (formInput.fields[idx].name !== "" && formInput.fields[idx].widgetType != "" && formInput.fields[idx].config.type != "") {
				if ((formInput.fields[idx].config.type == "enum" && formInput.fields[idx].config.options != "") || formInput.fields[idx].config.type != "enum") {
					isFormValid = true
				}
			}
		}

		if (isFormValid) {
			handleNext()
			parseInput()
		}
	}

	const clearForm = () => {
		// Reset stepper
		setActiveStep(0);

		// Reset state
		setFormInput({
			name: "",
			description: "",
			context: '{\n\t"abstract": "http://purl.org/dc/terms/abstract"\n}',
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
						<StepButton color="inherit" onClick={() => {
							setActiveStep(0)
						}}>
							Create metadata definition*
						</StepButton>
						<StepContent>
							<form onSubmit={handleNext}>
								<TextField
									variant="outlined"
									margin="normal"
									required
									fullWidth
									autoFocus
									id="name"
									label="Metadata Name"
									InputLabelProps={{shrink: true}}
									placeholder="Please enter metadata name"
									value={formInput["name"]}
									onChange={(event) => {
										handleInputChange(-1, "name", event.target.value);
									}}
								/>
								<TextField
									variant="outlined"
									margin="normal"
									required
									fullWidth
									id="metadata-description"
									label="Metadata Description"
									InputLabelProps={{shrink: true}}
									placeholder="Please enter metadata description"
									value={formInput.description}
									onChange={(event) => {
										handleInputChange(-1, "description", event.target.value);
									}}
								/>
                                {contextMap.map((item, idx) => {
								    return (<Grid container>
                                        <Grid item>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                fullWidth
                                                required
                                                id="metadata-context"
                                                label="Metadata Context Name"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="Please enter metadata context name"
                                                value={item["context_name"]}
                                                sx={{ mt: 1, mr: 1, "alignItems": "right", "width": "300px"  }}
                                                onChange={(event) => { updateContext(idx, "name", event.target.value); }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                id="metadata-auto-complete"
                                                freeSolo
                                                options={contextUrlMap["frequently_used"].map((option) => option.url)}
                                                renderInput={(params) => <TextField {...params} sx={{ mt: 1, mr: 1, "alignItems": "right", "width": "450px" }} label="Context URL" />}
                                            />
                                        </Grid>
                                        <IconButton color="primary" size="small"
                                                    onClick={() => addNewContext(idx)}>
                                            <AddBoxIcon/>
                                        </IconButton>
                                        {idx == 0 ? <></> : 
													<IconButton color="primary" size="small"
																onClick={() => removeContext(idx)}>
														<DeleteOutlineIcon/>
													</IconButton>}
                                    </Grid>)
                                 })}
                                    
								<Button variant="contained" onClick={() => validateFormData(activeStep)}>Next</Button>
							</form>
						</StepContent>
					</Step>

					{formInput.fields.map((input, idx) => {
						return (<Step key={idx}>
								{idx == 0 ?
									<StepButton color="inherit" onClick={() => {
										setActiveStep(idx + 1)
									}}>
										<StepLabel>Add metadata entry*
											{idx == activeStep - 1 ?
												<IconButton color="primary" size="small"
															onClick={() => addNewField(idx)}>
													<AddBoxIcon/>
												</IconButton>
												: <></>}
										</StepLabel>
									</StepButton>
									:
									<StepButton color="inherit" onClick={() => {
										setActiveStep(idx + 1)
									}}>
										<StepLabel>Add additional entry
											{idx == activeStep - 1 ?
												<>
													<IconButton color="primary" size="small"
																onClick={() => addNewField(idx)}>
														<AddBoxIcon/>
													</IconButton>
													<IconButton color="primary" size="small"
																onClick={() => removeField(idx)}>
														<DeleteOutlineIcon/>
													</IconButton>
												</>
												:
												<IconButton size="small" onClick={() => removeField(idx)}>
													<DeleteOutlineIcon/>
												</IconButton>}
										</StepLabel>
									</StepButton>
								}
								<StepContent>
									<Grid container>
										<Grid xs={4} md={4}>
											<FormGroup row>
												<FormControlLabel control={<Checkbox
													checked={input.list}
													onChange={(event) => {
														handleInputChange(idx, "list", event.target.value);
													}}
												/>} label="Allow Many"/>
												<FormControlLabel control={<Checkbox
													checked={input.required}
													onChange={(event) => {
														handleInputChange(idx, "required", event.target.value);
													}}
												/>} label="Required"/>
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
										InputLabelProps={{shrink: true}}
										value={input.name}
										onChange={(event) => {
											handleInputChange(idx, "name", event.target.value);
										}}
									/>
									<TextField
										variant="outlined"
										margin="normal"
										required
										fullWidth
										id="widget-type-select-label"
										label="Widget Type"
										placeholder="Please enter metadata description"
										value={input.widgetType}
										onChange={(event) => {
											handleInputChange(idx, "widgetType", event.target.value);
										}}
										InputLabelProps={{shrink: true}}
										helperText="Please select metadata widget type"
										select>
										{Object.keys(widgetTypes).map((key) => {
											return (
												<MenuItem value={key} key={key}>{widgetTypes[key]}</MenuItem>
											);
										})}
									</TextField>
									<TextField
										variant="outlined"
										margin="normal"
										required
										fullWidth
										id="input-type-select-label"
										label="Field Data Type"
										value={input.config.type}
										onChange={(event) => {
											handleInputChange(idx, "type", event.target.value);
										}}
										InputLabelProps={{shrink: true}}
										helperText="Please select metadata field data type"
										select>
										{Object.keys(inputTypes).map((key) => {
											return (
												<MenuItem value={key} key={key}>{inputTypes[key]}</MenuItem>
											);
										})}
									</TextField>
									{/*
                                      * TODO: Expand to support different config data type actions
                                      * https://github.com/clowder-framework/clowder2/issues/169
                                      */}
									{(input.config.type == "enum") ? <>
										<TextField
											variant="outlined"
											margin="normal"
											required
											fullWidth
											id="options"
											label="Supported List Values"
											InputLabelProps={{shrink: true}}
											placeholder="Please enter list options delimited by comma"
											value={input.config.options}
											onChange={(event) => {
												handleInputChange(idx, "options", event.target.value);
											}}
											name="Field Data Options"
											multiline
											maxRows={6}
										/>
									</> : <></>}
									<Button variant="contained" onClick={() => {
										validateFormData(activeStep)
									}}>
										Next
									</Button>
									<Button onClick={handleBack}>Back</Button>
								</StepContent>
							</Step>
						);
					})}
					<Step key="submit">
						<StepLabel>Submit</StepLabel>
						<StepContent>
							<TextField disabled value={parsedInput} multiline fullWidth/>
							<br/>
							<Button
								variant="contained"
								onClick={postMetadata}
								sx={{mt: 1, mr: 1, "alignItems": "right"}}>
								Submit
							</Button>
							<Button
								onClick={clearForm}
								sx={{mt: 1, mr: 1, "alignItems": "right"}}>
								Clear
							</Button>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</div>
	);
};
