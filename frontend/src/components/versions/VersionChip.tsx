import React, {useState} from "react";
import {Chip} from "@mui/material";
import {SelectVersionModal} from "../files/SelectVersionModal";
import ShareDatasetModal from "../datasets/ShareDatasetModal";
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";


type VersionChipProps = {
	versionNumber: number|undefined,
	selectedVersionNumber: number|undefined,
	versionNumbers: any;
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber, selectedVersionNumber, versionNumbers } = props;

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
				 selected_version={selectedVersionNumberFromState}
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
