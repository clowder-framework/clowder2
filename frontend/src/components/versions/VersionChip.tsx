import React, {useState} from "react";
import {Chip} from "@mui/material";
import {SelectVersionModal} from "../files/SelectVersionModal";
import ShareDatasetModal from "../datasets/ShareDatasetModal";


type VersionChipProps = {
	versionNumber: number|undefined,
	selectedVersionNumber: number|undefined,
	versionNumbers: any;
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber, selectedVersionNumber, versionNumbers } = props;

	const [changeVersion, setOpenChangeVersion] = useState(false);

	const [changeVersionOpen, setChangeVersionOpen] = useState(false);

	const clickChip = () => {
		console.log('clicked the chip')
		console.log(versionNumber, changeVersion);
		setOpenChangeVersion(true);
		console.log(changeVersion)
		setChangeVersionOpen(true);
	}

	const handleVersionSelectClose = () => {
        setOpenChangeVersion(false);
    }

	return (
		<>
				 <SelectVersionModal open={changeVersionOpen}
							 handleClose={handleVersionSelectClose}
							 selected_version={1}
							 fileVersions={versionNumbers}
		 	/>
			<Chip label={`V${versionNumber ?? ""}`}
			  clickable={true}
			  onClick={clickChip}
			/>
		</>

		// TODO can make this a clickable item
		// <Chip label={`V${versionNumber}`} component="a" href="/" clickable/> : <></>
	);
}
