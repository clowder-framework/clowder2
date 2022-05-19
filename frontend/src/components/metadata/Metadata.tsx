import React from "react";
import {Box, Button, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {Agent} from "./Agent";


export const Metadata = (props) => {

	const {metadata} = props;
	return (
		<>
			{
				metadata.map((item) => {
					if (item.definition in metadataConfig) {
						return (
							<Box className="inputGroup">
								{/*insert props*/}
								{
									(() => {
										return React.cloneElement(
											metadataConfig[item.definition],
											{
												widgetName: item.definition,
												key: item.id,
												contents: item.contents,
												readOnly:true,
											}
										);
									})()
								}
								<Agent created={item.created} agent={item.agent} />
							</Box>
						);
					}
				})
			}
		</>
	)
}
