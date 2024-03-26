import React, { useState } from "react";
import { Chip } from "@mui/material";

type VersionChipProps = {
	selectedVersion: number | undefined;
};

export function VersionChip(props: VersionChipProps) {
	const { selectedVersion } = props;

	return (
		<>
			<Chip
				title={"Change Version"}
				label={`V${selectedVersion ?? ""}`}
				size="small"
				sx={{ ml: 2 }}
			/>
		</>
	);
}
