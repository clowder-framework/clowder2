import React, {useEffect, useState} from "react";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {makeStyles} from "@material-ui/core/styles";
import File from "./File";
import Dataset from "./Dataset";
import {fetchFileMetadata} from "../utils/file";
import {downloadThumbnail} from "../utils/thumbnail";


const useStyles = makeStyles((theme) => ({

}));

export default function App(props) {
	const classes = useStyles();

	const [datasetId, setDatasetId] = useState("");
	const [selectedFileId, setSelectedFileId] = useState("");
	const [fileMetadataList, setFileMetadataList] = useState([]);
	const [thumbnailList, setThumbnailList] = useState([]);

	const [paths, setPaths] = useState(["explore", "collection", "dataset", ""]);

	const {
		// files
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,

		//dataset
		listFilesInDataset, filesInDataset,
		listDatasetAbout, datasetAbout,
		...other
	} = props;

	// component did mount
	useEffect(() => {
		listFilesInDataset();
		listDatasetAbout();
	}, []);

	// // set breadcrumbs
	// useEffect(() => {
	// 	setPaths(paths => [...paths.slice(0, paths.length - 1), fileMetadata["filename"]]);
	// }, [fileMetadata]);

	// get metadata of each files; because we need the thumbnail of each file!!!
	useEffect(() => {

		(async () => {
			if (filesInDataset !== undefined && filesInDataset.length > 0){

				let fileMetadataListTemp = [];
				let thumbnailListTemp = [];
				await Promise.all(filesInDataset.map(async (fileInDataset) => {

					let fileMetadata = await fetchFileMetadata(fileInDataset["id"]);

					// add thumbnails
					if (fileMetadata["thumbnail"] !== null && fileMetadata["thumbnail"] !== undefined){
						let thumbnailURL = await downloadThumbnail(fileMetadata["thumbnail"]);
						fileMetadataListTemp.push({"id":fileInDataset["id"], "metadata": fileMetadata, "thumbnail": thumbnailURL});
						thumbnailListTemp.push({"id":fileInDataset["id"], "thumbnail": thumbnailURL})
					}
				}));

				setFileMetadataList(fileMetadataListTemp);
				setThumbnailList(thumbnailListTemp);
			}
		})();
	}, [filesInDataset])

	const selectFile = (selectedFileId) => {
		// pass that id to file component
		setSelectedFileId(selectedFileId);

		// load file information
		listFileExtractedMetadata(selectedFileId);
		listFileMetadataJsonld(selectedFileId);
		listFilePreviews(selectedFileId);
	}

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs paths={paths}/>
				{
					selectedFileId === "" ?
						// Dataset page
						<Dataset selectFile={selectFile}
								 files={filesInDataset}
								 thumbnails={thumbnailList}
								 about={datasetAbout}
						/>
						:
						// file page
						fileMetadataList.map((fileMetadata) =>{
							if (selectedFileId === fileMetadata["id"]){
								return (
									<File fileMetadata={fileMetadata["metadata"]}
										  fileExtractedMetadata={fileExtractedMetadata}
										  fileMetadataJsonld={fileMetadataJsonld}
										  filePreviews={filePreviews}
										  fileId={selectedFileId}/>
								)
							}
						})
				}
			</div>
		</div>
	);
}
