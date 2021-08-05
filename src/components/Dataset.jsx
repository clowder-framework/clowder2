import React, {useEffect, useState} from "react";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {makeStyles} from "@material-ui/core/styles";
import {Link, Button} from "@material-ui/core";
import File from "./File";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar:{
		background: "#FFFFFF",
		boxShadow: "none",
	},
	tab:{
		fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform:"capitalize",
	},
	infoCard:{
		padding: "48px 0",
	},
	title:{
		fontWeight: "600",
		fontSize: "16px",
		color: "#000000",
		marginBottom:"8px"
	},
	content:{
		fontSize: "14px",
		color: "#000000",
	}
}));

export default function Dataset(props) {
	const classes = useStyles();

	const [fileId, setFileId] = useState("");
	const [paths, setPaths] = useState(["explore","collection", "dataset", ""]);

	const {
		listFileMetadata, fileMetadata,
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,
		...other
	} = props;

	useEffect(() => {
		// set breadcrumbs
		setPaths(paths => [...paths.slice(0, paths.length-1), fileMetadata["filename"]]);
	}, [fileMetadata]);

	const selectFile = (selectedFileId) => {
		// pass that id to file component
		setFileId(selectedFileId);

		// load file information
		listFileMetadata(selectedFileId);
		listFileExtractedMetadata(selectedFileId);
		listFileMetadataJsonld(selectedFileId);
		listFilePreviews(selectedFileId);

		{/*<TopBar/>*/}
		{/*<div className="outer-container">*/}
		{/*	<Breadcrumbs paths={["explore", "collection", "dataset", fileMetadata["filename"]]}/>*/}

	}

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs paths={paths}/>
				<Button color="inherit" onClick={() => selectFile("60ee082d5e0e3ff9d746b5fc")}>Text File</Button>
				<Button color="inherit" onClick={() => selectFile("59933ae8e4b04cf488f47aba")}>PDF File</Button>
				<Button color="inherit" onClick={() => selectFile("5d974f435e0eb9edf7b3cf00")}>Audio File</Button>
				<Button color="inherit" onClick={() => selectFile("59933ae9e4b04cf488f47b48")}>Video File</Button>
				<Button color="inherit" onClick={() => selectFile("576b0b1ce4b0e899329e8553")}>Image File</Button>
				<Button color="inherit" onClick={() => selectFile("60ee08325e0e3ff9d746bc57")}>Three D File</Button>
				{
					fileId !== "" ?
						<File fileMetadata={fileMetadata}
							  fileExtractedMetadata={fileExtractedMetadata}
							  fileMetadataJsonld={fileMetadataJsonld}
							  filePreviews={filePreviews}
							  fileId={fileId} />
						:
					<></>
				}
			</div>
		</div>
	);
}
