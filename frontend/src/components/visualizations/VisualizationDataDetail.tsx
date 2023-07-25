import React from "react";
import { parseDate } from "../../utils/common";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";
import { VisualizationDataOut } from "../../openapi/v2";

type FileAboutProps = {
	visualizationDataItem: VisualizationDataOut;
};

export function VisualizationDataDetail(props: FileAboutProps) {
	const { visualizationDataItem } = props;

	const details = new Map();
	details.set("Size", prettyBytes(visualizationDataItem.bytes ?? 0));
	details.set(
		"Content type",
		visualizationDataItem.content_type
			? visualizationDataItem.content_type.content_type
			: "NA"
	);
	details.set("Updated on", parseDate(visualizationDataItem.created));
	details.set("Uploaded as", visualizationDataItem.name);
	details.set(
		"Uploaded by",
		`${visualizationDataItem.creator.first_name}
														${visualizationDataItem.creator.last_name}`
	);
	details.set("Visualization id", visualizationDataItem.id);
	details.set("Descriptions", visualizationDataItem.description);

	return <StackedList keyValues={details} />;
}
