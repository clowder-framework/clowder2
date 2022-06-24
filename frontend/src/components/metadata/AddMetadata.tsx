import React, {useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";

type MetadataType = {
	saveMetadata: any,
	resourceType: string,
	resourceId: string|undefined,
}

/*
This is the interface add more metadata on a existing resource
Uses metadata definition as well as created metadata
*/
export const AddMetadata = (props: MetadataType) => {

	const {saveMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);
	const fileMetadataList = useSelector((state: RootState) => state.metadata.fileMetadataList);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	// complete metadata list with both definition and values
	useEffect(() => {
		if (resourceType === "dataset"){
			listDatasetMetadata(resourceId);
		}
		else if (resourceType === "file"){
			listFileMetadata(resourceId);
		}
	}, [resourceType, resourceId]);

	return (
		<>
			{
				(() => {
					let metadataList: string[] = [];
					if (resourceType === "dataset"){
						metadataList = datasetMetadataList.reduce((list:string[], item) => {
							return [...list, item.definition];
						}, []);
					}
					else if (resourceType === "file") {
						metadataList = fileMetadataList.reduce((list:string[], item) => {
							return [...list, item.definition];
						}, []);
					}

					return metadataDefinitionList.map((metadataDef) => {
						// filter and only show those do not already created
						if (!metadataList.includes(metadataDef.name) && metadataConfig[metadataDef.name]) {
							return (
								<Box className="inputGroup">
									<Typography variant="h6">{metadataDef.name}</Typography>
									<Typography variant="subtitle2">{metadataDef.description}</Typography>
									{
										(() => {
											return React.cloneElement(
												metadataConfig[metadataDef.name],
												{
													resourceId: resourceId,
													widgetName: metadataDef.name,
													saveMetadata: saveMetadata,
												}
											);
										})()
									}
								</Box>
							);
						}
					})
				})()
			}
		</>
	)
}
