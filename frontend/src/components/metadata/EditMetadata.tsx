import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { metadataConfig } from "../../metadata.config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {
	fetchDatasetMetadata,
	fetchFileMetadata,
	fetchMetadataDefinitions,
} from "../../actions/metadata";
import { Agent } from "./Agent";

type MetadataType = {
	setMetadata: any;
	resourceType: string;
	resourceId: string | undefined;
};

/*
This is the interface add more metadata on a existing resource
Uses metadata definition as well as created metadata
*/
export const EditMetadata = (props: MetadataType) => {
	const { setMetadata, resourceType, resourceId } = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList.data
	);
	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const listFileMetadata = (fileId: string | undefined) =>
		dispatch(fetchFileMetadata(fileId));
	const datasetMetadataList = useSelector(
		(state: RootState) => state.metadata.datasetMetadataList
	);
	const fileMetadataList = useSelector(
		(state: RootState) => state.metadata.fileMetadataList
	);
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const about = useSelector((state: RootState) => state.dataset.about);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	// complete metadata list with both definition and values
	useEffect(() => {
		if (resourceType === "dataset") {
			listDatasetMetadata(resourceId);
		} else if (resourceType === "file") {
			listFileMetadata(resourceId);
		}
	}, [resourceType, resourceId]);

	return (
		<>
			{(() => {
				let metadataList = [];
				let metadataNameList = [];
				if (resourceType === "dataset") {
					metadataList = datasetMetadataList;
					metadataNameList = datasetMetadataList.reduce(
						(list: string[], item) => {
							return [...list, item.definition];
						},
						[]
					);
				} else if (resourceType === "file") {
					metadataList = fileMetadataList;
					metadataNameList = fileMetadataList.reduce((list: string[], item) => {
						return [...list, item.definition];
					}, []);
				}

				return metadataDefinitionList.map((metadataDef) => {
					// filter and only show those do not already created
					if (!metadataNameList.includes(metadataDef.name)) {
						return (
							<Box className="inputGroup">
								<Typography variant="h6">{metadataDef.name}</Typography>
								<Typography variant="subtitle2">
									{metadataDef.description}
								</Typography>

								{
									// construct metadata using its definition
									metadataDef.fields.map((field) => {
										return React.cloneElement(
											metadataConfig[field.widgetType ?? "NA"] ??
												metadataConfig["NA"],
											{
												widgetName: metadataDef.name,
												fieldName: field.name,
												options: field.config.options ?? [],
												setMetadata: setMetadata,
												initialReadOnly: false,
												isRequired: field.required,
												datasetRole: datasetRole,
												frozen: about.frozen,
												frozenVersionNum: about.frozen_version_num,
											}
										);
									})
								}
							</Box>
						);
					} else {
						return metadataList.map((metadata, idx) => {
							if (metadataDef.name === metadata.definition) {
								return (
									<Box className="inputGroup" key={idx}>
										<Typography variant="h6">{metadata.definition}</Typography>
										<Typography variant="subtitle2">
											{metadata.description}
										</Typography>

										{
											// construct metadata using its definition
											metadataDef.fields.map((field, idxx) => {
												return React.cloneElement(
													metadataConfig[field.widgetType ?? "NA"] ??
														metadataConfig["NA"],
													{
														widgetName: metadataDef.name,
														fieldName: field.name,
														options: field.config.options ?? [],
														setMetadata: setMetadata,
														initialReadOnly: false,
														resourceId: resourceId,
														content: metadata.content ?? null,
														metadataId: metadata.id ?? null,
														isRequired: field.required,
														key: idxx,
														datasetRole: datasetRole,
														frozen: about.frozen,
														frozenVersionNum: about.frozen_version_num,
													}
												);
											})
										}
										<Agent created={metadata.created} agent={metadata.agent} />
									</Box>
								);
							}
						});
					}
				});
			})()}
		</>
	);
};
