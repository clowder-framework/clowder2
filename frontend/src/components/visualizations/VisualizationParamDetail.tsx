import React from "react";
import { StackedList } from "../util/StackedList";
import { VisualizationConfigOut } from "../../openapi/v2";
import { Typography } from "@mui/material";

type FileAboutProps = {
	visConfigEntry: VisualizationConfigOut;
};

export function VisualizationParamDetail(props: FileAboutProps) {
	const { visConfigEntry } = props;

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();

	for (const key in visConfigEntry.parameters) {
		details.set(key, { value: visConfigEntry.parameters[key] });
	}

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Visualization Information
			</Typography>
			<StackedList keyValues={details} />
		</>
	);
}
