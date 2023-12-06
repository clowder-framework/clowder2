import React, {useEffect} from "react";
import {Box, Grid, Typography} from "@mui/material";
import {metadataConfig} from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";
import {fetchPublicFileMetadata} from "../../actions/public_file";
import {fetchPublicDatasetMetadata} from "../../actions/public_dataset";
import {Agent} from "./Agent";
import {MetadataDeleteButton} from "./widgets/MetadataDeleteButton";

type MetadataType = {
	updateMetadata: any,
	deleteMetadata: any,
	resourceType:string|undefined,
	resourceId:string|undefined,
	publicView:boolean|false,
}

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const DisplayMetadata = (props: MetadataType) => {

	const {updateMetadata, deleteMetadata, resourceType, resourceId, publicView} = props;

	const dispatch = useDispatch();

	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const listPublicDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchPublicDatasetMetadata(datasetId));
	const listPublicFileMetadata = (fileId: string | undefined) => dispatch(fetchPublicFileMetadata(fileId));
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);
	const fileMetadataList = useSelector((state: RootState) => state.metadata.fileMetadataList);
	const publicDatasetMetadataList = useSelector((state: RootState) => state.metadata.publicDatasetMetadataList);
	const publicFileMetadataList = useSelector((state: RootState) => state.metadata.publicFileMetadataList);


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
			if (publicView){
				listPublicDatasetMetadata(resourceId);
			} else {
				listDatasetMetadata(resourceId);
			}
		}
		else if (resourceType === "file"){
			if (publicView){
				listPublicFileMetadata(resourceId);
			} else {
				listFileMetadata(resourceId);
			}
		}
	}, [resourceType, resourceId]);

	return (
		<>
			{
				(() => {
					let metadataList = [];
					if (resourceType === "dataset" && !publicView) metadataList = datasetMetadataList;
					else if (resourceType === "file" && !publicView) metadataList = fileMetadataList;
					else if (resourceType === "file" && publicView) metadataList = publicFileMetadataList;
					else if (resourceType === "dataset" && publicView) metadataList = publicDatasetMetadataList;
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
														key:idxx
													}
												);
											})
										}
										<Grid container spacing={2}>
											{publicView?
												(
													<></>
												) :
												<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
													<Agent created={metadata.created} agent={metadata.agent} />
													<MetadataDeleteButton metadataId={metadata.id ?? null}
																	  deleteMetadata={deleteMetadata}
																	  resourceId={resourceId}
																	  widgetName={metadataDef.name}
													/>
												</Grid>
											}
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
