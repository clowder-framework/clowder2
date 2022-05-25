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

export const CreateMetadata = (props: MetadataType) => {

	const {saveMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	return (
		<>
			{
				metadataDefinitionList.map((metadata) => {
					if (metadataConfig[metadata.name]) {
						return (
							<Box className="inputGroup">
								<Typography variant="h6">{metadata.name}</Typography>
								<Typography variant="subtitle2">{metadata.description}</Typography>
								{
									(() => {
										return React.cloneElement(
											metadataConfig[metadata.name],
											{
												resourceId: resourceId,
												widgetName: metadata.name,
												saveMetadata: saveMetadata,
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
