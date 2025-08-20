import React from "react";
import { Box, Typography } from "@mui/material";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { parseDate } from "../../utils/common";
import { EventListenerOut as Listener } from "../../openapi/v2";
import Chip from "@mui/material/Chip";
import { ListenerInfoDetails } from "./ListenerInfoDetails";
import { theme } from "../../theme";

type ListenerInfoProps = {
	selectedExtractor: Listener | undefined;
	defaultExpanded?: boolean;
};

const customStyles = {
	authorInfo: {
		color: theme.palette.info.main,
		fontSize: "12px",
		margin: "0.75em 0 0.75em 0",
	},
};

export const ListenerInfo = (props: ListenerInfoProps) => {
	const { selectedExtractor, defaultExpanded } = props;

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
			{selectedExtractor &&
			selectedExtractor["created"] &&
			selectedExtractor["properties"] &&
			selectedExtractor["properties"]["author"] ? (
				<ClowderFootnote style={customStyles.authorInfo}>
					{`Created by ${
						selectedExtractor["properties"]["author"]
					} at ${parseDate(selectedExtractor["created"])}`}
				</ClowderFootnote>
			) : null}
			{selectedExtractor && selectedExtractor["description"] ? (
				<Typography>{selectedExtractor["description"]}</Typography>
			) : null}
			{selectedExtractor ? (
				<ListenerInfoDetails
					listener={selectedExtractor}
					defaultExpanded={defaultExpanded}
				/>
			) : null}
		</Box>
	);
};
