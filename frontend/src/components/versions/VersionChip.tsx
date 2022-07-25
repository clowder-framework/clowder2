import React from "react";
import {Chip} from "@mui/material";


type VersionChipProps = {
	versionNumber: number|undefined,
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber } = props;

	return (
		<Chip label={`V${versionNumber}`}/>
		// TODO can make this a clickable item
		// <Chip label={`V${versionNumber}`} component="a" href="/" clickable/> : <></>
	);
}
