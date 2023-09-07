import * as React from "react";
import Chip from "@mui/material/Chip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { capitalize } from "../../utils/common";

type RoleProps = {
	role: string;
};

export default function RoleChip(props: RoleProps) {
	const { role } = props;
	return (
		<>
			{role === "owner" ? (
				<Chip
					size="small"
					icon={<VisibilityIcon />}
					label={capitalize(role)}
					sx={{ ml: 2 }}
				/>
			) : (
				<></>
			)}
			{role === "viewer" ? (
				<Chip
					size="small"
					icon={<VisibilityIcon />}
					label={capitalize(role)}
					sx={{ ml: 2 }}
				/>
			) : (
				<></>
			)}
			{role === "uploader" ? (
				<Chip
					size="small"
					icon={<VisibilityIcon />}
					label={capitalize(role)}
					sx={{ ml: 2 }}
				/>
			) : (
				<></>
			)}
			{role === "editor" ? (
				<Chip
					size="small"
					icon={<VisibilityIcon />}
					label={capitalize(role)}
					sx={{ ml: 2 }}
				/>
			) : (
				<></>
			)}
		</>
	);
}
