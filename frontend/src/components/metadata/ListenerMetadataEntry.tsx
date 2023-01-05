import React, {useEffect} from "react";
import {Box, Grid, Typography} from "@mui/material";
import {metadataConfig} from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";
import {Agent} from "./Agent";
import {MetadataDeleteButton} from "./widgets/MetadataDeleteButton";


type ListenerMetadata = {
	agent: any,
	contents: any,
	context: any,
	context_url: any,
	created: string,
}

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const ListenerMetadataEntry = (props: ListenerMetadata) => {

	const {agent, contents, context, context_url, created} = props;

	const dispatch = useDispatch();

	return (
		<>
			{
				(() => {
					console.log(contents);
					return "Nothing yet"

				})()
			}
		</>
	)
}
