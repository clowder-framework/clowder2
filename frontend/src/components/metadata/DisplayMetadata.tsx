import React, {useEffect} from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata} from "../../actions/metadata";
import {Agent} from "./Agent";

type MetadataType = {
	updateMetadata: any,
	resourceType:string|undefined,
	resourceId:string|undefined,
}

export const DisplayMetadata = (props: MetadataType) => {

	const {updateMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);

	// complete metadata list with both definition and values

	useEffect(() => {
		if (resourceType === "dataset"){
			listDatasetMetadata(resourceId);
		}
		// else if (resourceType === "file") listFileMetadata(resourceId);
	}, [resourceType, resourceId]);

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
												updateMetadata: updateMetadata,
												contents: metadata.contents ?? null,
												metadataId: metadata.id ?? null,
											}
										);
									})()
								}
								<Agent created={metadata.created} agent={metadata.agent} />
							</Box>
						);
					}
				})
			}
		</>
	)
}
