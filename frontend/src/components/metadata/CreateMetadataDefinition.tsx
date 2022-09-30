import React, {useEffect, useState} from "react";

import {Box, Button, Grid, TextField} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import TopBar from "../navigation/TopBar";
import { postMetadataDefinitions } from "../../actions/metadata";

export const CreateMetadataDefinitionPage = (): JSX.Element => {
	return (
		<div>
			<TopBar/>
			<CreateMetadataDefinition/>
		</div>
	);
}

export const CreateMetadataDefinition = (): JSX.Element => {

	const dispatch = useDispatch();
	// @ts-ignore
	const saveMetadataDefinitions = (metadata: object) => dispatch(postMetadataDefinitions(metadata));

	const [metadataName, setMetadataName] = React.useState<string>("");
	const [metadataDescription, setMetadataDescription] = React.useState<string>("");

	const addNewField = () => {
		// TODO: Complete this portion
	}

    const postMetadata = () => {
		console.log("Inside postMetadata");

		// TODO: Make the field populate dynamically
		saveMetadataDefinitions({
			"name" : metadataName,
			"description" : metadataDescription,
			"context" : {
				"doi" : "https://schema.org/DigitalDocument"
			},
			"fields" : [
				{
					"name" : "doi",
					"list" : false,
					"widgetType": "TextField",
					"config": {
						"type" : "str"
					},
					"required" : true
				}
			]
		});

		clearForm();
	}

	const clearForm = () => {
		setMetadataName("");
		setMetadataDescription("");
	}

	return (
		<div className="outer-container">
			<div className="inner-container">
				<Grid container spacing={2} rowSpacing={4}>
					<Grid xs={12} md={8}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							autoFocus
							id="metadataName"
							label="Metadata Name"
							name="metadataName"
							value={metadataName}
							onChange={(event) => { setMetadataName(event.target.value); }}
						/>
						
					</Grid>
					<Grid xs={12} md={8}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="metadataDescription"
							label="Metadata Description"
							name="metadataDescription"
							value={metadataDescription}
							onChange={(event) => { setMetadataDescription(event.target.value); }}
						/>
					</Grid>
					<Grid xs={12} md={8}>
						<Button onClick={() => {postMetadata();}}>+ Add New Field</Button>
					</Grid>
					<Grid xs={12} md={8}>
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
					</Grid>
				</Grid>
			</div>
		</div>
	);
};
