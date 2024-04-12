import React from "react";
import { parseDate } from "../../utils/common";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";
import { VisualizationDataOut } from "../../openapi/v2";
import { Typography } from "@mui/material";

type FileAboutProps = {
	visualizationDataItem: VisualizationDataOut;
};

export function VisualizationDataDetail(props: FileAboutProps) {
	const { visualizationDataItem } = props;

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();

	details.set("Size", { value: prettyBytes(visualizationDataItem.bytes ?? 0) });
	details.set("Content type", {
		value: visualizationDataItem.content_type
			? visualizationDataItem.content_type.content_type
			: "NA",
	});
	details.set("Updated on", {
		value: parseDate(visualizationDataItem.created),
		info: "Latest date and time of the file being updated",
	});
	details.set("Uploaded as", {
		value: visualizationDataItem.name,
		info: "Name of the visualization extractor",
	});
	details.set("Uploaded by", {
		value: `${visualizationDataItem.creator.first_name} ${visualizationDataItem.creator.last_name}`,
	});
	details.set("Visualization id", { value: visualizationDataItem.id });
	details.set("Descriptions", {
		value: visualizationDataItem.description,
		info: "Description of the visualization",
	});

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Visualization Information
			</Typography>
			<StackedList keyValues={details} />
		</>
	);
}
