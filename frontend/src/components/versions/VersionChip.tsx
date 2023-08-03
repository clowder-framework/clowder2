import React, {useState} from "react";
import {Chip} from "@mui/material";


type VersionChipProps = {
	versionNumber: number|undefined,
	selectedVersionNumber: number|undefined,
	versionNumbers: any;
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber, selectedVersionNumber, versionNumbers } = props;

	const [changeVersion, setOpenChangeVersion] = useState(false);

	const clickChip = () => {
		console.log('clicked the chip')
		console.log(versionNumber, changeVersion);
		setOpenChangeVersion(true);
		console.log(changeVersion)
	}

	return (
		<Chip label={`V${versionNumber ?? ""}`}
			  clickable={true}
			  onClick={clickChip}
		/>
		// TODO can make this a clickable item
		// <Chip label={`V${versionNumber}`} component="a" href="/" clickable/> : <></>
	);
}
