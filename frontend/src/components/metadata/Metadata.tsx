import React from "react";
import {Box, Button, Typography} from "@mui/material";
import metadataConfig from "../../metadata.config";


export const Metadata = (props) => {
	// const {metadataDefinition} = props;
	const metadataDefinition =
		[
			{
				"widget_id": "time",
				"widget_name": "start time",
				"key": "1234563225",
			},
			{
				"widget_id": "time",
				"widget_name": "end time",
				"key": "789101112",
			},
			{
				"widget_id": "unit",
				"widget_name": "unit",
				"key": "234343253",
			},
			{
				"widget_id": "alternative_title",
				"widget_name": "title",
				"key": "2343432123",
			},
			{
				"widget_id": "alternative_title",
				"widget_name": "subtitle",
				"key": "234322123",
			},
			{
				"widget_id": "doi",
				"widget_name": "DOI",
				"key": "2343432512",
			},
		];

	return (
		<>
			{
				metadataDefinition.map((item) => {
					if (item.widget_id in metadataConfig) {
						return (
							<Box className="inputGroup">
								{/*insert props*/}
								{
									(() => {
										return React.cloneElement(
											metadataConfig[item.widget_id],
											{ widgetName: item.widget_name, key: item.key}
										);
									})()
								}
							</Box>
						);
					}
				})
			}
			<Box className="inputGroup">
				<Button variant="contained" type="submit" className="form-button-block">Create Metadata</Button>
			</Box>
		</>
	)
}
