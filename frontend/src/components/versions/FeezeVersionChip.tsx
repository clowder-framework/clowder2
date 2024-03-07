import React from "react";
import { Box, Tooltip } from "@mui/material";
import { FrozenState } from "../../openapi/v2";
import { ClowderVersionTextLight } from "../styledComponents/ClowderVersionText";

type FreezeVersionChipProps = {
	frozen: string | undefined;
	frozenVersionNum: number | undefined;
};

export function FreezeVersionChip(props: FreezeVersionChipProps) {
	const { frozen, frozenVersionNum } = props;

	return (
		<>
			{frozen === FrozenState.FROZEN &&
			frozenVersionNum &&
			frozenVersionNum > 0 ? (
				<Box sx={{ display: "flex", alignItems: "end" }}>
					<Tooltip title="This is frozen version.">
						<ClowderVersionTextLight>
							v{frozenVersionNum}
						</ClowderVersionTextLight>
					</Tooltip>
				</Box>
			) : frozen === FrozenState.FROZEN_DRAFT ? (
				<Box sx={{ display: "flex", alignItems: "end" }}>
					<Tooltip title="This is working draft.">
						<ClowderVersionTextLight>latest</ClowderVersionTextLight>
					</Tooltip>
				</Box>
			) : (
				<></>
			)}
		</>
	);
}
