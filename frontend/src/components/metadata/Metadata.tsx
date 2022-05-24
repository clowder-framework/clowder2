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

export const Metadata = (props: MetadataType) => {

	const {saveMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));

	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);
	const datasetMetadataList = useSelector((state: RootState) => state.metadata.datasetMetadataList);

	// complete metadata list with both definition and values
	const [complMetadataList, setComplMetadatList] = useState(metadataDefinitionList);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
		if (resourceType === "dataset") listDatasetMetadata(resourceId);


		// else if (resourceType === "file") listFileMetadata(resourceId);
	}, []);

	useEffect(() => {
		const tempMetadataList = [];

		for (let i = 0; i < metadataDefinitionList.length; i++) {
			let matched = false;
			for (let j= 0; j <datasetMetadataList.length; j++){
				if (metadataDefinitionList[i].name === datasetMetadataList[j].definition) {
					tempMetadataList.push({...metadataDefinitionList[i],
						contents: datasetMetadataList[j].contents,
						metadataId: datasetMetadataList[j].id});
					matched = true;
				}
			}
			if (!matched) tempMetadataList.push(metadataDefinitionList[i]);
		}

		setComplMetadatList(tempMetadataList);
	}, [datasetMetadataList])

	return (
		<>
			{
				complMetadataList.map((metadata) => {
					return (
						<Box className="inputGroup">
							<Typography variant="h6">{metadata.name}</Typography>
							<Typography variant="subtitle2">{metadata.description}</Typography>
							{
								(() => {
									return React.cloneElement(
										metadataConfig[metadata.name],
										{
											resourceId:resourceId,
											widgetName: metadata.name,
											saveMetadata: saveMetadata,
											contents: metadata.contents ?? null,
											metadataId: metadata.id ?? null,
										}
									);
								})()
							}
						</Box>
					);
				})
			}
		</>
	)
}
