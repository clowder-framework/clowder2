import React from "react";
import { Box, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { theme } from "../../theme";
import { ClowderFootnote } from "../styledComponents/ClowderFootnote";
import { FrozenState } from "../../openapi/v2";
import EditNoteIcon from "@mui/icons-material/EditNote";

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
					<Tooltip title="Freezed">
						<LockIcon sx={{ color: theme.palette.primary.main }} />
					</Tooltip>
					<ClowderFootnote>v{frozenVersionNum}</ClowderFootnote>
				</Box>
			) : frozen === FrozenState.FROZEN_DRAFT ? (
				<Box sx={{ display: "flex", alignItems: "end" }}>
					<Tooltip title="Draft">
						<EditNoteIcon sx={{ color: theme.palette.primary.main }} />
					</Tooltip>
					{/*<ClowderFootnote>v{frozenVersionNum}</ClowderFootnote>*/}
				</Box>
			) : (
				<></>
			)}
		</>
	);
}
