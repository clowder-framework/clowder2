import React, {useEffect} from "react";
import {Box, Grid, Typography} from "@mui/material";
import {metadataConfig} from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";
import {Agent} from "./Agent";
import {MetadataDeleteButton} from "./widgets/MetadataDeleteButton";

type MetadataType = {
	updateMetadata: any,
	deleteMetadata: any,
	resourceType:string|undefined,
	resourceId:string|undefined,
}

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const DisplayMetadata = (props: MetadataType) => {

	const {updateMetadata, deleteMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();

	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const adminMode = useSelector((state : RootState) => state.user.adminMode);
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId, adminMode));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId, adminMode));
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);
	const fileMetadataList = useSelector((state: RootState) => state.metadata.fileMetadataList);
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	console.log(updateMetadata, 'updateMetadataDisplay');
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
					let metadataList = [];
					if (resourceType === "dataset") metadataList = datasetMetadataList;
					else if (resourceType === "file") metadataList = fileMetadataList;

					return metadataDefinitionList.map((metadataDef) => {
						return metadataList.map((metadata,idx) => {
							if (metadataDef.name === metadata.definition) {
								return (
									<Box className="inputGroup" key={idx}>
										<Typography variant="h6">{metadata.definition}</Typography>
										<Typography variant="subtitle2">{metadata.description}</Typography>
										{
											// construct metadata using its definition
											metadataDef.fields.map((field,idxx) => {
												return React.cloneElement(
													metadataConfig[field.widgetType ?? "NA"] ?? metadataConfig["NA"],
													{
														widgetName: metadataDef.name,
														fieldName: field.name,
														options: field.config.options ?? [],
														updateMetadata: updateMetadata,
														initialReadOnly: true,
														resourceId: resourceId,
														content: metadata.content ?? null,
														metadataId: metadata.id ?? null,
														isRequired: field.required,
														key:idxx,
														datasetRole: datasetRole
													}
												);
											})
										}
										<Grid container spacing={2}>
											<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
												<Agent created={metadata.created} agent={metadata.agent} />
												{datasetRole.role !== undefined  && datasetRole.role !== "viewer" ?
													<MetadataDeleteButton metadataId={metadata.id ?? null}
																	  deleteMetadata={deleteMetadata}
																	  resourceId={resourceId}
																	  widgetName={metadataDef.name}
													/> :
													<></>
												}
											</Grid>
										</Grid>
									</Box>
								);
							}
						});

					});
				})()
			}
		</>
	);
};
