import React from "react";
import {Box, Button, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";
import {Agent} from "./Agent";


export const Metadata = (props) => {

	const {metadata} = props;
	// const metadata =
	// 	[
	// 		{
	// 			"id": "6286642c5685a1694705c85f",
	// 			"context": null,
	// 			"context_url": "clowder.org",
	// 			"definition": null,
	// 			"contents": {
	// 				"color": "blue"
	// 			},
	// 			"resource": {
	// 				"collection": "datasets",
	// 				"resource_id": "627a8d09ca3d2920a17f602a",
	// 				"version": null
	// 			},
	// 			"agent": {
	// 				"id": "6286642c5685a1694705c860",
	// 				"creator": {
	// 					"id": "627a8d01ca3d2920a17f6025",
	// 					"email": "cwang138@illinois.edu",
	// 					"first_name": "Chen",
	// 					"last_name": "Wang"
	// 				},
	// 				"extractor": null
	// 			},
	// 			"created": "2022-05-19T15:37:16.065000"
	// 		},
	// 		{
	// 			"id": "628664405685a1694705c863",
	// 			"context": null,
	// 			"context_url": null,
	// 			"definition": "LatLon",
	// 			"contents": {
	// 				"longitude": 40.123,
	// 				"latitude": -88.777
	// 			},
	// 			"resource": {
	// 				"collection": "datasets",
	// 				"resource_id": "627a8d09ca3d2920a17f602a",
	// 				"version": null
	// 			},
	// 			"agent": {
	// 				"id": "628664405685a1694705c865",
	// 				"creator": {
	// 					"id": "627a8d01ca3d2920a17f6025",
	// 					"email": "cwang138@illinois.edu",
	// 					"first_name": "Chen",
	// 					"last_name": "Wang"
	// 				},
	// 				"extractor": null
	// 			},
	// 			"created": "2022-05-19T15:37:36.334000"
	// 		}
	// 	];

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
			{/*<Box className="inputGroup">*/}
			{/*	<Button variant="contained" type="submit" className="form-button-block">Create Metadata</Button>*/}
			{/*</Box>*/}
		</>
	)
}
