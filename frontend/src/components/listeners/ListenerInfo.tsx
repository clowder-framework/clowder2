import React from "react";
import { Box, Typography } from "@mui/material";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { parseDate } from "../../utils/common";
import { Listener } from "../../types/data";

type ListenerInfoProps = {
	selectedExtractor: Listener | undefined;
};

export const ListenerInfo = (props: ListenerInfoProps) => {
	const { selectedExtractor } = props;

	return (
		<Box>
			{selectedExtractor && selectedExtractor["name"] ? (
				<ClowderTitle>{selectedExtractor["name"]}</ClowderTitle>
			) : null}
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
