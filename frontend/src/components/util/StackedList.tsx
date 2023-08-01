import React from "react";
import { Box, Stack, Typography } from "@mui/material";

type StackedListProps = {
	keyValues: Map<string, string>;
};

export function StackedList(props: StackedListProps) {
	const { keyValues } = props;

	const entries: Array<JSX.Element> = [];
	// forEach expects value first and then key
	keyValues.forEach((value, key) => {
		entries.push(
			<Box>
				<Typography sx={{ wordBreak: "break-all" }}>{value}</Typography>
				<Typography variant="caption" sx={{ color: "text.secondary" }}>
					{key}
				</Typography>
			</Box>
		);
	});

	return <Stack spacing={2}>{entries}</Stack>;
}
