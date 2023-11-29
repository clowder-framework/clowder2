import React, { useState } from "react";
import { Button } from "@mui/material";
import { parseDate } from "../../utils/common";
import { StackedList } from "../util/StackedList";
import { EventListenerOut as Listener } from "../../openapi/v2";

type ListenerAboutProps = {
	listener: Listener;
};

const accordionStyle = {
	accordion: {
		boxShadow: "none",
		border: "none",
	},
	accordionSummary: {
		backgroundColor: "transparent",
	},
};
export function ListenerInfoDetails(props: ListenerAboutProps) {
	const { listener } = props;
	const [expanded, setExpanded] = useState(false);

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	const details = new Map<string, string>();
	details.set("Last Alive", parseDate(listener.lastAlive ?? ""));
	details.set("Last Modified", parseDate(listener.modified ?? ""));

	if (listener.properties) {
		details.set("Maturity", listener.properties.maturity ?? "");

		if (
			listener.properties.contributors &&
			listener.properties.contributors.length > 0
		) {
			details.set("Contributors", listener.properties.contributors.join(", "));
		}

		if (
			listener.properties.external_services &&
			listener.properties.external_services.length > 0
		) {
			details.set(
				"External Services",
				listener.properties.external_services.join(", ")
			);
		}

		if (
			listener.properties.categories &&
			listener.properties.categories.length > 0
		) {
			details.set("Categories", listener.properties.categories.join(", "));
		}

		if (listener.properties.bibtex && listener.properties.bibtex.length > 0) {
			details.set(
				"Bibtex",
				listener.properties.bibtex.join(", ") !== ""
					? listener.properties.bibtex.join(", ")
					: "Not Available"
			);
		}

		if (
			listener.properties.default_labels &&
			listener.properties.default_labels.length > 0
		) {
			details.set(
				"Default Labels",
				listener.properties.default_labels.join(", ")
			);
		}

		if (
			listener.properties.libraries &&
			listener.properties.libraries.length > 0
		) {
			details.set("Libraries", listener.properties.libraries.join(", "));
		}

		if (
			listener.properties.process &&
			Object.keys(listener.properties.process).length > 0
		) {
			Object.keys(listener.properties.process).forEach((key) => {
				details.set(
					`Process ${key} by`,
					listener.properties.process[key].join(", ")
				);
			});
		}

		if (
			listener.properties.contexts &&
			listener.properties.contexts.length > 0
		) {
			listener.properties.contexts.forEach((context) => {
				Object.keys(context).forEach((key) => {
					details.set(`Context: ${key}`, context[key]);
				});
			});
		}

		if (
			listener.properties.repository &&
			listener.properties.repository.length > 0
		) {
			listener.properties.repository.forEach((repo) => {
				Object.keys(repo).forEach((key) => {
					details.set(key, repo[key] !== "" ? repo[key] : "Not Available");
				});
			});
		}
	}

	return (
		<>
			<Button
				onClick={() => {
					setExpanded(true);
				}}
			>
				More Details...
			</Button>
			{expanded ? <StackedList keyValues={details} /> : null}
		</>
	);
}
