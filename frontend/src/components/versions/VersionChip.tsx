import React, {useState} from "react";
import {Chip} from "@mui/material";
import {SelectVersionModal} from "../files/SelectVersionModal";
import ShareDatasetModal from "../datasets/ShareDatasetModal";
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";


type VersionChipProps = {
	versionNumber: number|undefined,
	selectedVersion: number|undefined,
	setSelectedVersion: any| undefined;
	versionNumbers: any| undefined;
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber, selectedVersion, setSelectedVersion, versionNumbers } = props;

	const [changeVersion, setOpenChangeVersion] = useState(false);
	const selectedVersionNumberFromState = useSelector((state: RootState) => state.file.selected_version_num);

	const clickChip = () => {
		console.log('clicked chip', selectedVersionNumberFromState, 'from state');
		console.log(versionNumber, changeVersion);
		console.log(changeVersion)
		setOpenChangeVersion(true);
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
			<Chip label={`V${selectedVersion ?? ""}`}
			  clickable={true}
			  onClick={clickChip}
			/>
		</>

		// TODO can make this a clickable item
		// <Chip label={`V${versionNumber}`} component="a" href="/" clickable/> : <></>
	);
}
