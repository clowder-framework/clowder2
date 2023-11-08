import React from "react";
import { Box, Typography } from "@mui/material";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { parseDate } from "../../utils/common";
import { Listener } from "../../types/data";
import Chip from "@mui/material/Chip";

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
			selectedExtractor["author"] ? (
				<ClowderFootnote>
					{`Created by ${selectedExtractor["author"]} at ${parseDate(
						selectedExtractor["created"]
					)}`}
				</ClowderFootnote>
			) : null}
		</Box>
	);
};
