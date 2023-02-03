import React, {useEffect, useState} from "react";
import {Box, Grid, Typography} from "@mui/material";
import {metadataConfig} from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";
import {Agent} from "./Agent";
import {MetadataDeleteButton} from "./widgets/MetadataDeleteButton";
import {ListenerMetadataEntry} from "../metadata/ListenerMetadataEntry";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

type MetadataType = {
	updateMetadata: any,
	deleteMetadata: any,
	resourceType: string | undefined,
	resourceId: string | undefined,
}

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const DisplayListenerMetadata = (props: MetadataType) => {

	const {updateMetadata, deleteMetadata, resourceType, resourceId} = props;

	const dispatch = useDispatch();

	const getMetadatDefinitions = (name: string | null, skip: number, limit: number) => dispatch(fetchMetadataDefinitions(name, skip, limit));
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
		if (resourceType === "dataset") {
			listDatasetMetadata(resourceId);
		} else if (resourceType === "file") {
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
					let listenerMetadataList = [];
					let listenerMetadataContent = [];

					return (<Grid container spacing={2}>
						{metadataList.map((metadata, idx) => {
						if (metadata.agent.listener !== null) {
							return (<Grid item xs={12}><Card key={idx}>
								<CardContent>
									<ListenerMetadataEntry agent={metadata.agent}
														   content={metadata.content}
														   context={metadata.context}
														   context_url={metadata.context_url}
														   created={metadata.created}
									/>
								</CardContent>
							</Card></Grid>);
						}
						})}
					</Grid>);
			})()
			}
		</>
	)
}
