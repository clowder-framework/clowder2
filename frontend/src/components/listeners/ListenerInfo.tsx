import React from "react";
import { Box, Typography } from "@mui/material";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { parseDate } from "../../utils/common";
import { EventListenerOut as Listener } from "../../openapi/v2";
import Chip from "@mui/material/Chip";
import { ListenerInfoDetails } from "./ListenerInfoDetails";

type ListenerInfoProps = {
	selectedExtractor: Listener | undefined;
};

export const ListenerInfo = (props: ListenerInfoProps) => {
	const { selectedExtractor } = props;

	return (
		<Box>
			<Box sx={{ display: "flex" }}>
				{selectedExtractor && selectedExtractor["name"] ? (
					<ClowderTitle>{selectedExtractor["name"]}</ClowderTitle>
				) : null}
				{selectedExtractor && selectedExtractor["version"] ? (
					<Chip
						label={`v${selectedExtractor["version"]}`}
						size="small"
						sx={{ ml: 1 }}
					/>
				) : (
					<></>
				)}
			</Box>
			{selectedExtractor && selectedExtractor["description"] ? (
				<Typography>{selectedExtractor["description"]}</Typography>
			) : null}
			{selectedExtractor &&
			selectedExtractor["created"] &&
			selectedExtractor["properties"] &&
			selectedExtractor["properties"]["author"] ? (
				<ClowderFootnote>
					{`Created by ${
						selectedExtractor["properties"]["author"]
					} at ${parseDate(selectedExtractor["created"])}`}
				</ClowderFootnote>
			) : null}
			{selectedExtractor ? (
				<ListenerInfoDetails listener={selectedExtractor} />
			) : null}
		</Box>
	);
};
