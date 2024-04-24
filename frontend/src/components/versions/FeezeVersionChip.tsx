import React from "react";
import { Box, Tooltip } from "@mui/material";
import { ClowderVersionTextLight } from "../styledComponents/ClowderVersionText";

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
						<ClowderVersionTextLight>
							v{frozenVersionNum}
						</ClowderVersionTextLight>
					</Tooltip>
				</Box>
			) : (
				<Box sx={{ display: "flex", alignItems: "end" }}>
					<Tooltip title="This is a current draft.">
						<ClowderVersionTextLight>current</ClowderVersionTextLight>
					</Tooltip>
				</Box>
			)}
		</>
	);
}
