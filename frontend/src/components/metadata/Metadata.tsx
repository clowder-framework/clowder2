import React, {useEffect} from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchMetadataDefinitions} from "../../actions/metadata";


export const Metadata = (props) => {

	const {saveMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));

	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
		if (resourceType === "dataset") listDatasetMetadata(resourceId);
		// else if (resourceType === "file") listFileMetadata(resourceId);
	}, []);

	return (
		<>
			{
				metadataDefinitionList.map((definition) => {
					// list metadata form from definition
					if (resourceType === "dataset"){
						// fill in the values if there is an instance of such metadata
						return datasetMetadataList.map((metadata) => {
							if (metadata.definition === definition.name){
								return (
									<Box className="inputGroup">
										<Typography variant="h6">{definition.name}</Typography>
										<Typography variant="subtitle2">{definition.description}</Typography>
										{
											(() => {
												return React.cloneElement(
													metadataConfig[definition.name],
													{
														resourceId:resourceId,
														widgetName: definition.name,
														saveMetadata: saveMetadata,
														contents: metadata.contents,
														metadataId: metadata.id,
													}
												);
											})()
										}
									</Box>
								)
							}
						});
					}
				})
			}
			{
				datasetMetadataList.map((metadata) => {
					// list metadata form from definition
					if (resourceType === "dataset"){
						// empty form for those not mentioned
						return metadataDefinitionList.map((definition) => {
							if (definition.name === metadata.definitiond){
								return
							}
							else{

							}
						});
					}
				})
			}
			);
		</>
	)
}
