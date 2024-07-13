import React from "react";
import { Box, Tooltip } from "@mui/material";
import { ClowderVersionPill } from "../styledComponents/ClowderVersionText";

type FreezeVersionChipProps = {
	frozen: boolean | undefined;
	frozenVersionNum: number | undefined;
};

export function FreezeVersionChip(props: FreezeVersionChipProps) {
	const { frozen, frozenVersionNum } = props;

	return (
		<>
			{frozen && frozenVersionNum && frozenVersionNum > 0 ? (
				<Box sx={{ display: "flex", alignItems: "end" }}>
					<Tooltip title="This is a historical version.">
						<ClowderVersionPill>v{frozenVersionNum}</ClowderVersionPill>
					</Tooltip>
				</Box>
			) : (
				<></>
			)}
		</>
	);
}
