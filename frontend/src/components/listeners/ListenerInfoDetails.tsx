import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { parseDate } from "../../utils/common";
import { StackedList } from "../util/StackedList";
import { EventListenerOut as Listener } from "../../openapi/v2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type ListenerAboutProps = {
	listener: Listener;
	defaultExpanded?: boolean;
};

export function ListenerInfoDetails(props: ListenerAboutProps) {
	const { listener, defaultExpanded } = props;
	const [expanded, setExpanded] = useState(
		defaultExpanded ? defaultExpanded : false
	);

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();

	details.set("Last Alive", {
		value: parseDate(listener.lastAlive ?? ""),
		info: "Last time the listener was up" + " running",
	});
	details.set("Last Modified", {
		value: parseDate(listener.modified ?? ""),
		info: "Last time the listener was modified",
	});

	if (listener.properties) {
		details.set("Maturity", {
			value: listener.properties.maturity ?? "",
			info: "Stage of the listener. e.g. alpha, beta, stable",
		});

		if (
			listener.properties.contributors &&
			listener.properties.contributors.length > 0
		) {
			details.set("Contributors", {
				value: listener.properties.contributors.join(", "),
			});
		}

		if (
			listener.properties.external_services &&
			listener.properties.external_services.length > 0
		) {
			details.set("External Services", {
				value: listener.properties.external_services.join(", "),
				info: "External services used by the listener",
			});
		}

		if (
			listener.properties.categories &&
			listener.properties.categories.length > 0
		) {
			details.set("Categories", {
				value: listener.properties.categories.join(", "),
				info: "Categories of the" + " listener",
			});
		}

		if (listener.properties.bibtex && listener.properties.bibtex.length > 0) {
			details.set("Bibtex", {
				value:
					listener.properties.bibtex.join(", ") !== ""
						? listener.properties.bibtex.join(", ")
						: "Not Available",
				info: "Bibtex format of citation of the listener",
			});
		}

		if (
			listener.properties.default_labels &&
			listener.properties.default_labels.length > 0
		) {
			details.set("Default Labels", {
				value: listener.properties.default_labels.join(", "),
				info: "Labels of the listener",
			});
		}

		if (
			listener.properties.libraries &&
			listener.properties.libraries.length > 0
		) {
			details.set("Libraries", {
				value: listener.properties.libraries.join(", "),
				info: "Libraries used by the listener",
			});
		}

		if (
			listener.properties.process &&
			Object.keys(listener.properties.process).length > 0
		) {
			Object.keys(listener.properties.process).forEach((key) => {
				details.set(`Process ${key} by`, {
					value: listener.properties.process[key].join(", "),
				});
			});
		}

		if (
			listener.properties.contexts &&
			listener.properties.contexts.length > 0
		) {
			listener.properties.contexts.forEach((context) => {
				Object.keys(context).forEach((key) => {
					details.set(`Context: ${key}`, {
						value: context[key],
						info: "Context of the listener",
					});
				});
			});
		}

		if (
			listener.properties.repository &&
			listener.properties.repository.length > 0
		) {
			listener.properties.repository.forEach((repo) => {
				Object.keys(repo).forEach((key) => {
					details.set(key, {
						value: repo[key] !== "" ? repo[key] : "Not Available",
						info: "Code repository of the listener",
					});
				});
			});
		}
	}

	return (
		<Box mt={2} mb={2}>
			{!expanded && !defaultExpanded ? (
				<Button
					onClick={() => {
						setExpanded(true);
					}}
					sx={{ padding: 0, float: "right" }}
					endIcon={<ExpandMoreIcon />}
				>
					Read More
				</Button>
			) : null}

			{expanded ? <StackedList keyValues={details} /> : null}

			{expanded && !defaultExpanded ? (
				<Button
					onClick={() => {
						setExpanded(false);
					}}
					sx={{ padding: 0, float: "right" }}
					endIcon={<ExpandLessIcon />}
				>
					Read Less
				</Button>
			) : null}
		</Box>
	);
}
