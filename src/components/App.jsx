import React, {useEffect, useState} from "react";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {makeStyles} from "@material-ui/core/styles";
import {fetchFileMetadata} from "../utils/file";
import {downloadThumbnail} from "../utils/thumbnail";
import Dashboard from "./Dashbard";
import Dataset from "./Dataset";
import File from "./File";


const useStyles = makeStyles((theme) => ({}));

export default function App(props) {
	const classes = useStyles();

	const [selectedFileId, setSelectedFileId] = useState("");
	const [selectedDatasetId, setSelectedDatasetId] = useState("");
	const [fileMetadataList, setFileMetadataList] = useState([]);
	const [fileThumbnailList, setFileThumbnailList] = useState([]);
	const [datasetThumbnailList, setDatasetThumbnailList] = useState([]);

	const [paths, setPaths] = useState([]);

	const {
		// files
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,

		//dataset
		listFilesInDataset, filesInDataset,
		listDatasetAbout, datasetAbout,

		//dashboard
		listDatasets, datasets,

		...other
	} = props;

	// component did mount
	useEffect(() => {
		listDatasets();
	}, []);

	useEffect(() => {

		(async () => {
			if (datasets !== undefined && datasets.length > 0) {

				let datasetThumbnailListTemp = [];
				await Promise.all(datasets.map(async (dataset) => {
					// add thumbnails
					if (dataset["thumbnail"] !== null && dataset["thumbnail"] !== undefined) {
						let thumbnailURL = await downloadThumbnail(dataset["thumbnail"]);
						datasetThumbnailListTemp.push({"id": dataset["id"], "thumbnail": thumbnailURL})
					}
				}));
				setDatasetThumbnailList(datasetThumbnailListTemp);
			}
		})();
	}, [datasets])

	// get metadata of each files; because we need the thumbnail of each file!!!
	useEffect(() => {

		(async () => {
			if (filesInDataset !== undefined && filesInDataset.length > 0) {

				let fileMetadataListTemp = [];
				let fileThumbnailListTemp = [];
				await Promise.all(filesInDataset.map(async (fileInDataset) => {

					let fileMetadata = await fetchFileMetadata(fileInDataset["id"]);
					fileMetadataListTemp.push({"id": fileInDataset["id"], "metadata": fileMetadata});

					// add thumbnails
					if (fileMetadata["thumbnail"] !== null && fileMetadata["thumbnail"] !== undefined) {
						let thumbnailURL = await downloadThumbnail(fileMetadata["thumbnail"]);
						fileThumbnailListTemp.push({"id": fileInDataset["id"], "thumbnail": thumbnailURL})
					}
				}));

				setFileMetadataList(fileMetadataListTemp);
				setFileThumbnailList(fileThumbnailListTemp);
			}
		})();
	}, [filesInDataset])

	const selectDataset = (selectedDatasetId) => {
		// pass that id to dataset component
		setSelectedDatasetId(selectedDatasetId);

		// load dataset information
		listFilesInDataset(selectedDatasetId);
		listDatasetAbout(selectedDatasetId);

		// for breadcrumb
		let datasetName = selectedDatasetId;
		datasets.map(dataset =>{
			if (dataset["id"] === selectedDatasetId) datasetName = dataset["name"];
		});
		setPaths([
			{
				"name":datasetName,
				"id": selectedDatasetId,
				"type":"dataset"
			}
		]);
	}

	const selectFile = (selectedFileId) => {
		// pass that id to file component
		setSelectedFileId(selectedFileId);

		// load file information
		listFileExtractedMetadata(selectedFileId);
		listFileMetadataJsonld(selectedFileId);
		listFilePreviews(selectedFileId);

		// for breadcrumb
		let datasetName = selectedDatasetId;
		datasets.map(dataset =>{
			if (dataset["id"] === selectedDatasetId) datasetName = dataset["name"];
		});
		let fileName = selectedFileId;
		filesInDataset.map(file =>{
			if (file["id"] === selectedFileId) fileName = file["filename"];
		});

		setPaths([
			{
				"name":datasetName,
				"id": selectedDatasetId,
				"type":"dataset"
			},
			{
				"name":fileName,
				"id": selectedFileId,
				"type":"file"
			}
		]);
	}

	const goToPath = (pathType, id) => {
		if (pathType === "dataset"){
			setSelectedDatasetId(id);
			setSelectedFileId("");

			let datasetName = id;
			datasets.map((dataset)=>{ if (dataset["id"] === id) datasetName = dataset["name"]});
			setPaths([
				{
					"name": datasetName,
					"id": id,
					"type":"dataset"
				},
			]);
		}
		else{
			setSelectedDatasetId("");
			setSelectedFileId("");
			setPaths([]);
		}
	}

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs paths={paths} goToPath={goToPath}/>
				{
					(() => {
						if (selectedDatasetId === "") {
							return <Dashboard datasets={datasets} selectDataset={selectDataset}
											  thumbnails={datasetThumbnailList}/>
						} else if (selectedFileId === "") {
							return <Dataset files={filesInDataset} selectFile={selectFile}
											thumbnails={fileThumbnailList} about={datasetAbout}/>
						} else {
							return fileMetadataList.map((fileMetadata) => {
								if (selectedFileId === fileMetadata["id"]) {
									return (
										<File fileMetadata={fileMetadata["metadata"]}
											  fileExtractedMetadata={fileExtractedMetadata}
											  fileMetadataJsonld={fileMetadataJsonld}
											  filePreviews={filePreviews}
											  fileId={selectedFileId}/>
									)
								}
								else{
									return <></>;
								}
							});
						}
					})()
				}
				</div>
		</div>
	);
}
