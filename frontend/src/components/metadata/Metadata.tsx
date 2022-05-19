import React from "react";
import {Box, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {Agent} from "./Agent";


export const Metadata = (props) => {

	const {metadata, saveMetadata, resourceId} = props;
	return (
		<>
			{
				metadata.map((item) => {
					// list metadata attached on resources
					if (item.definition && item.definition in metadataConfig) {
						return (
							<Box className="inputGroup">
								<Typography>{item.definition}</Typography>
								{
									(() => {
										return React.cloneElement(
											metadataConfig[item.definition],
											{
												resourceId:resourceId,
												widgetName: item.definition,
												metadataId: item.id,
												contents: item.contents,
												readOnly:true,
												saveMetadata: saveMetadata
											}
										);
									})()
								}
								<Agent created={item.created} agent={item.agent} />
							</Box>
						);
					}
					// list metadata form from definition
					else if (item.name && item.name in metadataConfig){
						return (
							<Box className="inputGroup">
								<Typography variant="h6">{item.name}</Typography>
								<Typography variant="subtitle2">{item.description}</Typography>
								{
									(() => {
										return React.cloneElement(
											metadataConfig[item.name],
											{
												resourceId:resourceId,
												widgetName: item.name,
												// metadataId: item.id,
												// contents: item.contents,
												readOnly:false,
												// updateMetadata: updateMetadata
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
