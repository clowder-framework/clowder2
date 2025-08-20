import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type StackedListProps = {
	keyValues: Map<string, { value: string | undefined; info?: string }>;
};

export function StackedList(props: StackedListProps) {
	const { keyValues } = props;

	const entries = Array.from(keyValues, ([key, { value, info }]) => (
		<Box key={key}>
			<Typography sx={{ wordBreak: "break-all" }}>{value}</Typography>
			<Tooltip title={info ?? ""}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Typography variant="caption" sx={{ color: "text.primary.light" }}>
						{key}
					</Typography>
					{info && (
						<InfoOutlinedIcon sx={{ fontSize: "0.75rem!important", ml: 0.5 }} />
					)}
				</Box>
			</Tooltip>
		</Box>
	));

	return <Stack spacing={2}>{entries}</Stack>;
}
