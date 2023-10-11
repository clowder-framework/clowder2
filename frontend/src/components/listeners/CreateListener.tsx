import React, { useEffect, useState } from "react";

import {
	Autocomplete,
	Box,
	Button,
	ButtonGroup,
	Divider,
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	Grid,
	IconButton,
	InputBase,
	List,
	Radio,
	RadioGroup,
	TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../types/data";

// import { CreateListenerModal } from "./CreateListenerModal";
// import { CreateMetadata } from "../metadata/CreateMetadata";
// import {
// 	fetchMetadataDefinitions,
// 	postDatasetMetadata,
// } from "../../actions/metadata";
// import { MetadataIn } from "../../openapi/v2";
// import { datasetCreated, resetDatsetCreated } from "../../actions/dataset";
// import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { ErrorModal } from "../errors/ErrorModal";

export const CreateListener = (): JSX.Element => {
	// const dispatch = useDispatch();
	// @ts-ignore
	// const getMetadatDefinitions = (
	// 	name: string | null,
	// 	skip: number,
	// 	limit: number
	// ) => dispatch(fetchMetadataDefinitions(name, skip, limit));
	// const createDatasetMetadata = (
	// 	datasetId: string | undefined,
	// 	metadata: MetadataIn
	// ) => dispatch(postDatasetMetadata(datasetId, metadata));
	// const   = (formData: FormData) =>
	// 	dispatch(datasetCreated(formData));
	// const newDataset = useSelector(
	// 	(state: RootState) => state.dataset.newDataset
	// );

	// useEffect(() => {
	// 	getMetadatDefinitions(null, 0, 100);
	// }, []);

	// const metadataDefinitionList = useSelector(
	// 	(state: RootState) => state.metadata.metadataDefinitionList
	// );
	const [errorOpen, setErrorOpen] = useState(false);

	// const [datasetRequestForm, setdatasetRequestForm] = useState({});
	// const [metadataRequestForms, setMetadataRequestForms] = useState({});
	// const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	// const history = useNavigate();

	// const checkIfFieldsAreRequired = () => {
	// 	let required = false;

	// 	metadataDefinitionList.forEach((val, idx) => {
	// 		if (val.fields[0].required) {
	// 			required = true;
	// 		}
	// 	});

	// 	return required;
	// };

	// step 1
	// const onDatasetSave = (formData: any) => {
	// 	setdatasetRequestForm(formData);

	// 	// If no metadata fields are marked as required, allow user to skip directly to submit
	// 	if (checkIfFieldsAreRequired()) {
	// 		setAllowSubmit(false);
	// 	} else {
	// 		setAllowSubmit(true);
	// 	}

	// 	handleNext();
	// };
	// step 2
	// const setMetadata = (metadata: any) => {
	// 	// TODO wrap this in to a function
	// 	setMetadataRequestForms((prevState) => {
	// 		// merge the contents field; e.g. lat lon
	// 		if (metadata.definition in prevState) {
	// 			const prevContent = prevState[metadata.definition].content;
	// 			metadata.content = { ...prevContent, ...metadata.content };
	// 		}
	// 		return { ...prevState, [metadata.definition]: metadata };
	// 	});

	// 	metadataDefinitionList.map((val, idx) => {
	// 		if (val.fields[0].required) {
	// 			// Condition checks whether the current updated field is a required one
	// 			if (
	// 				val.name == metadata.definition ||
	// 				val.name in metadataRequestForms
	// 			) {
	// 				setAllowSubmit(true);
	// 				return true;
	// 			} else {
	// 				setAllowSubmit(false);
	// 				return false;
	// 			}
	// 		}
	// 	});
	// };

	// step
	// const [activeStep, setActiveStep] = useState(0);
	// const handleNext = () => {
	// 	setActiveStep((prevActiveStep) => prevActiveStep + 1);
	// };
	// const handleBack = () => {
	// 	setActiveStep((prevActiveStep) => prevActiveStep - 1);
	// };

	// // finish button post dataset; dataset ID triggers metadata posting
	// const handleFinish = () => {
	// 	// create dataset
	// 	createDataset(datasetRequestForm);
	// };

	// useEffect(() => {
	// 	if (newDataset.id) {
	// 		// post new metadata
	// 		Object.keys(metadataRequestForms).map((key) => {
	// 			createDatasetMetadata(newDataset.id, metadataRequestForms[key]);
	// 		});

	// 		//reset dataset so next creation can be done
	// 		dispatch(resetDatsetCreated());
	// 		setMetadataRequestForms({});
	// 		setdatasetRequestForm({});

	// 		// zoom into that newly created dataset
	// 		history(`/datasets/${newDataset.id}`);
	// 	}
	// }, [newDataset]);

	useEffect(() => {
		fetch('https://huggingface.co/api/models')
			.then(response => response.json())
			.then(data => {
				// Sort the models by downloads before mapping to modelNames
				data.sort((a: any, b: any) => b.downloads - a.downloads);
				const modelNames = data.map((model: any) => model.id);
				setHuggingFaceModelNames(modelNames);
			})
			.catch(error => console.error('Error:', error));
	}, []);


	const [huggingFaceModelNames, setHuggingFaceModelNames] = useState<string[]>(["meta/llama2-70B-chat", "google/Flan-t5-large"]);
	const [selectedHuggingFaceModelName, setSelectedHuggingFaceModelName] = useState<string>("");

	const handleHuggingFaceModelSubmit = () => {
		const selectedModelName = document.getElementById('huggingface-model-name')?.value; // type: ignore
		if (selectedModelName) {
			alert(`Selected HuggingFace Model: ${selectedModelName}`);
		} else {
			alert('No model selected');
		}
	};

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
				<Box className="inner-container">

					<IntroMessage />

					<h1>
						Run any HuggingFace model on your data, no code
					</h1>

					<Box sx={{ margin: "2em auto", padding: "0.5em" }}>
						{/*HuggingFace inference*/}
						<FormControl>
							<FormLabel sx={{ paddingBottom: "1em" }}>
								Run HuggingFace inference over your files
								<FormHelperText sx={{ fontSize: "0.8em" }}>
									You can select any model on the HuggingFace Hub. Then you can run that model over your files, with no code, no infrastructure and all without ever leaving this GUI.
									The below models are sorted by number of downloads on <a href="https://huggingface.co/models" target="_blank" rel="noopener noreferrer">HuggingFace Hub</a>.
								</FormHelperText>
							</FormLabel>
							{/* HuggingFace model name input */}
							<Autocomplete
								id="huggingface-model-name"
								options={huggingFaceModelNames}
								freeSolo
								renderInput={(params) => (
									<TextField {...params} label="HuggingFace Model Name" variant="outlined" />
								)}
								onInputChange={(event, newInputValue) => {
									setSelectedHuggingFaceModelName(newInputValue);
								}}
							/>
							<Button
								variant="contained"
								color="primary"
								onClick={handleHuggingFaceModelSubmit}
								disabled={!selectedHuggingFaceModelName}
							>
								Submit
							</Button>
							<Box sx={{ margin: "2em auto", padding: "0.5em" }}>
								{/*access*/}
								<FormControl>
									<FormLabel id="radio-buttons-group-label-access">
										Security Level
									</FormLabel>
									<FormHelperText sx={{ fontSize: "0.8em" }}>
										Choose your endpoint&apos;s level of privacy.
									</FormHelperText>
									<RadioGroup
										aria-labelledby="radio-buttons-group-label-access"
										defaultValue="protected"
										name="radio-buttons-group-access"
									>
										<FormControlLabel value="protected" control={<Radio />} label="Protected" />
										<FormHelperText sx={{ fontSize: "0.8em" }}>
											A Protected Endpoint is available from the Internet, secured with TLS/SSL and requires a valid Clowder API Token for authentication.
										</FormHelperText>
										<FormControlLabel value="public" control={<Radio />} label="Public" />
										<FormHelperText sx={{ fontSize: "0.8em" }}>
											A Public Endpoint is available from the internet, secured with TLS/SSL and requires NO authentication.
										</FormHelperText>
									</RadioGroup>
								</FormControl>
							</Box>

						</FormControl>
					</Box>
					{/* </Grid > */}

					{/* TODO: possibly implement the Stepper box for iterative form filling... */}


					{/* <Box>
						<Stepper activeStep={activeStep} orientation="vertical">
							
							<Step key="create-dataset">
								<StepLabel>Basic Information</StepLabel>
								<StepContent>
									<Typography>
										A dataset is a container for files, folders and metadata.
									</Typography>
									<Box>
										<CreateListenerModal onSave={onDatasetSave} />
									</Box>
								</StepContent>
							</Step>

							
							<Step key="fill-in-metadata">
								<StepLabel>Required Metadata</StepLabel>
								<StepContent>
									{metadataDefinitionList.length > 0 ? (
										<Typography>
											This metadata is required when creating a new dataset.
										</Typography>
									) : (
										<Typography>No metadata required.</Typography>
									)}
									<Box>
										<CreateMetadata setMetadata={setMetadata} />
									</Box>
							
									<Box sx={{ mb: 2 }}>
										<>
											<Button
												variant="contained"
												onClick={handleFinish}
												disabled={!allowSubmit}
												sx={{ mt: 1, mr: 1 }}
											>
												Finish
											</Button>
											<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
												Back
											</Button>
										</>
									</Box>
								</StepContent>
							</Step>
						</Stepper>
					</Box> */}
				</Box>
			</Box>
		</Layout >
	);
};

const IntroMessage = () => {
	return (
		<>
			<h1>
				Create a new Extractor
			</h1>
			<h2>
				Why Extractors?
			</h2>
			<p>
				At its heart, <strong>extractors run a Python function over every file in a dataset</strong>. They can run at the click of a button in Clowder web UI or like an event listener every time a new file is uploaded.
			</p>
			<p>
				Extractors are performant, parallel-by-default, web-native <a href="https://github.com/clowder-framework/pyclowder">Clowder Extractors</a> using <a href="https://research.ibm.com/blog/codeflare-ml-experiments">CodeFlare</a> &amp; <a href="https://www.ray.io/">Ray.io</a>.
				Check out our <a href="https://github.com/clowder-framework/CodeFlare-Extractors/blob/main/utils/media/Getting_Started_with_Ray_Workflows.pdf">📜 blog post on the incredible speed and developer experience</a> of building on Ray.
			</p>
			<h3>
				🧠 ML Inference
			</h3>
			<p>
				Need to process a lot of files? <strong>This is great for ML inference and data pre-processing</strong>. These examples work out of the box or you can swap in your own model!
			</p>
			<p>
				TODO: These may examples need updating because they&apos;re traditional extractors, not this 100% GUI extractor version.
				<img src="https://pytorch.org/assets/images/pytorch-logo.png" width="40" align="left" />
				<a href="https://github.com/clowder-framework/CodeFlare-Extractors/tree/main/parallel-batch-ml-inference-pytorch">PyTorch example</a>
				<br />
				<br />
				<img src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg" width="40" align="left" />
				<a href="https://github.com/clowder-framework/CodeFlare-Extractors/tree/main/parallel_batch_ml_inference">TensorFlow Keras example</a>
				<br />
				<br />
				<img src="https://em-content.zobj.net/thumbs/120/apple/325/hugging-face_1f917.png" width="40" align="left" />
				<a href="https://github.com/clowder-framework/CodeFlare-Extractors/tree/main/parallel-batch-ml-inference-huggingface">Huggingface Transformers example</a>
				<br />
				<br />
			</p>
			<h3>
				🔁 Event-driven
			</h3>
			<p>
				Have daily data dumps? <strong>Extractors are perfect for event-driven actions</strong>. They will run code every time a file is uploaded. Uploads themselves can be automated via <a href="https://github.com/clowder-framework/pyclowder">PyClowder</a> for a totally hands-free data pipeline.
			</p>
			{/* <h3>
				Clowder&apos;s rich scientific data ecosystem
			</h3>
			<p>
				Benefit from the rich featureset & full extensibility of Clowder:
			</p>
			<ul>
				<li>Instead of files on your laptop, use Clowder to add collaborators & share datasets via the browser.</li>
				<li>Benefiting scientists, we work with (~)every filetype and have rich extensibility for any job you need to run.</li>
			</ul> */}
		</>
	)
}