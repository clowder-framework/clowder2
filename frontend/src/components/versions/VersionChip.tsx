import React, {useState} from "react";
import {Chip} from "@mui/material";
import {SelectVersionModal} from "../files/SelectVersionModal";


type VersionChipProps = {
	selectedVersion: number|undefined,
	setSelectedVersion: any| undefined;
	versionNumbers: any| undefined;
	isClickable:boolean|false;
}

export function VersionChip(props: VersionChipProps) {

	const { selectedVersion, setSelectedVersion, versionNumbers, isClickable } = props;

	const [changeVersion, setOpenChangeVersion] = useState(false);

	const clickChip = () => {
		if (isClickable) {
			setOpenChangeVersion(true);
		}
	}

	const handleVersionSelectClose = () => {
        setOpenChangeVersion(false);
    }

	return (
		<>
			<SelectVersionModal open={changeVersion}
				 handleClose={handleVersionSelectClose}
				 selectedVersion={selectedVersion}
				 setSelectedVersion={setSelectedVersion}
				 fileVersions={versionNumbers}
		 	/>
			<Chip
				title={"Change Version"}
				label={`V${selectedVersion ?? ""}`}
			  	clickable={isClickable}
			  	onClick={clickChip}
			/>
		</>

	);
}
