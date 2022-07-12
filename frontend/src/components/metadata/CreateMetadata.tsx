import React, {useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchMetadataDefinitions} from "../../actions/metadata";

type MetadataType = {
	setMetadata: any,
}

/*
This is the interface when create new dataset and new files
Uses only registered metadata definition to populate the form
 */
export const CreateMetadata = (props: MetadataType) => {

	// const {saveMetadata, setContents} = props;

	const {setMetadata} = props;
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
												widgetName: metadata.name,
												setMetadata: setMetadata,
												initialReadOnly: false,
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
