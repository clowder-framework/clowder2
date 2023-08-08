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
	isClickable:boolean|undefined;
}

export function VersionChip(props: VersionChipProps) {

	const { versionNumber, selectedVersion, setSelectedVersion, versionNumbers, isClickable } = props;

	const [changeVersion, setOpenChangeVersion] = useState(false);
	const selectedVersionNumberFromState = useSelector((state: RootState) => state.file.selected_version_num);

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
			<Chip label={`V${selectedVersion ?? ""}`}
			  clickable={isClickable}
			  onClick={clickChip}
			/>
		</>

	);
}
