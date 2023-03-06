import * as React from "react";
import Chip from "@mui/material/Chip";
import FaceIcon from "@mui/icons-material/Face";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";

type RoleProps = {
	role:string
}

export default function RoleChip(props: RoleProps) {
	const {role} = props;
	return (
		<>
			{
				role === "owner" ? <Chip icon={<FaceIcon/>} label={role.toUpperCase()}/> : <></>
			}
			{
				role === "viewer" ? <Chip icon={<VisibilityIcon/>} label={role.toUpperCase()}/> : <></>
			}
			{
				role === "uploader" ? <Chip icon={<CloudUploadIcon/>} label={role.toUpperCase()}/> : <></>
			}
			{
				role === "editor" ? <Chip icon={<EditIcon/>} label={role.toUpperCase()}/> : <></>
			}
		</>
	);
}
