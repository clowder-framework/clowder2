import React from "react";
import { Box, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { theme } from "../../theme";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";

type VersionChipProps = {
	frozenVersionNum: number | undefined;
};

export function FreezeVersionChip(props: VersionChipProps) {
	const { frozenVersionNum } = props;

	return (
		<Box sx={{ display: "flex", alignItems: "end" }}>
			<Tooltip title="Freezed">
				<LockIcon sx={{ color: theme.palette.primary.main }} />
			</Tooltip>
			<ClowderFootnote>v{frozenVersionNum}</ClowderFootnote>
		</Box>
	);
}
