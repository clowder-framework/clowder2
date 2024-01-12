import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { metadataConfig } from "../../metadata.config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchMetadataDefinitions } from "../../actions/metadata";

type MetadataType = {
	setMetadata: any;
};

/*
This is the interface when create new dataset and new files
Uses only registered metadata definition to populate the form
 */
export const CreateMetadata = (props: MetadataType) => {
	const { setMetadata, sourceItem } = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList
	);
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	return (
		<>
			{metadataDefinitionList.map((metadata, idx) => {
				return (
					<Box className="inputGroup" key={idx}>
						{sourceItem === "datasets" && metadata.required_for_items.datasets ? (
						  <Typography>
							This metadata is required for creating new datasets.
						  </Typography>
						) : sourceItem === "files" && metadata.required_for_items.files ? (
						  <Typography>
							This metadata is required for creating new files.
						  </Typography>
						) : (
						  <Typography>This metadata is optional for creating new {sourceItem}.</Typography>
						)}
						<Typography variant="h6">
							{metadata.name}{" "}
							{metadata.fields.some((field) => field.required && ((sourceItem == "datasets" && metadata.required_for_items.datasets) || (sourceItem == "files" && metadata.required_for_items.files)) && (<span>*</span>))}
						</Typography>
						<Typography variant="subtitle2">{metadata.description}</Typography>
						{metadata.fields.map((field, idxx) => {
							return React.cloneElement(
								// if nothing match fall back to default widget
								metadataConfig[field.widgetType ?? "NA"] ??
									metadataConfig["NA"],
								{
									widgetName: metadata.name,
									fieldName: field.name,
									options: field.config.options ?? [],
									setMetadata: setMetadata,
									initialReadOnly: false,
									isRequired: field.required,
									datasetRole: datasetRole,
									key: idxx
								}
							);
						})}
					</Box>
				);
			})}
		</>
	);
};
