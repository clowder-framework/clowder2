import React, {useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchMetadataDefinitions} from "../../actions/metadata";

type MetadataType = {
	saveMetadata: any,
	resourceType:string|undefined,
	resourceId:string|undefined,
}

export const DisplayMetadata = (props: MetadataType) => {

	const {saveMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);

	// complete metadata list with both definition and values

	useEffect(() => {
		if (resourceType === "dataset") listDatasetMetadata(resourceId);
		// else if (resourceType === "file") listFileMetadata(resourceId);
	}, []);

	return (
		<>
			{
				datasetMetadataList.map((metadata) => {
					if (metadataConfig[metadata.definition]) {
						return (
							<Box className="inputGroup">
								<Typography variant="h6">{metadata.definition}</Typography>
								<Typography variant="subtitle2">{metadata.description}</Typography>
								{
									(() => {
										return React.cloneElement(
											metadataConfig[metadata.definition],
											{
												resourceId: resourceId,
												widgetName: metadata.definition,
												saveMetadata: saveMetadata,
												contents: metadata.contents ?? null,
												metadataId: metadata.id ?? null,
											}
										);
									})()
								}
							</Box>
						);
					}
				})
			}
		</>
	)
}
