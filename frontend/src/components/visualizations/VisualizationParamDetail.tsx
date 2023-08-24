import React from "react";
import { StackedList } from "../util/StackedList";
import { VisualizationConfigOut } from "../../openapi/v2";
import { Typography } from "@mui/material";

type FileAboutProps = {
	visConfigEntry: VisualizationConfigOut;
};

export function VisualizationParamDetail(props: FileAboutProps) {
	const { visConfigEntry } = props;

	const details = new Map();

	for (const key in visConfigEntry.parameters) {
		details.set(key, visConfigEntry.parameters[key]);
	}

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details} />
		</>
	);
}
