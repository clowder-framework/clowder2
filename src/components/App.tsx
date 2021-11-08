import React, {useEffect, useState} from "react";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {fetchFileMetadata} from "../utils/file";
import {downloadThumbnail} from "../utils/thumbnail";
import Dashboard from "./Dashbard";
import Dataset from "./Dataset";
import File from "./File";
import datasetSchema from "../schema/datasetSchema.json";
import fileSchema from "../schema/fileSchema.json";

import {useDispatch, useSelector} from "react-redux";
import {fileDeleted, fetchFileExtractedMetadata, fetchFileMetadataJsonld, fetchFilePreviews} from "../actions/file";
import {datasetDeleted, fetchDatasetAbout, fetchDatasets, fetchFilesInDataset} from "../actions/dataset";
import {RootState} from "../types/data";


export function App(): JSX.Element {

	// props
	const dispatch = useDispatch();

	const listFileExtractedMetadata = (fileId:string) => dispatch(fetchFileExtractedMetadata(fileId));
	const listFileMetadataJsonld = (fileId:string) => dispatch(fetchFileMetadataJsonld(fileId));
	const listFilePreviews = (fileId:string) => dispatch(fetchFilePreviews(fileId));
	const listFilesInDataset = (datasetId:string) => dispatch(fetchFilesInDataset(datasetId));
	const deleteFile = (fileId:string) => dispatch(fileDeleted(fileId));
	const listDatasetAbout= (datasetId:string) => dispatch(fetchDatasetAbout(datasetId));
	const listDatasets = (when:string, date:string, limit:string) => dispatch(fetchDatasets(when, date, limit));
	const deleteDataset= (datasetId:string) => dispatch(datasetDeleted(datasetId));

	const fileExtractedMetadata = useSelector((state:RootState) =>  state.file.extractedMetadata);
	const fileMetadataJsonld = useSelector((state:RootState) => state.file.metadataJsonld);
	const filePreviews = useSelector((state:RootState) => state.file.previews);
	const filesInDataset = useSelector((state:RootState) => state.dataset.files);
	const datasetAbout = useSelector((state:RootState) => state.dataset.about);
	const datasets = useSelector((state:RootState) => state.dataset.datasets);

	const [selectedFileId, setSelectedFileId] = useState("");
	const [,setSelectedFilename] = useState("");
	const [selectedDatasetId, setSelectedDatasetId] = useState("");
	const [selectedDatasetName, setSelectedDatasetName] = useState("");
	const [fileMetadataList, setFileMetadataList] = useState([]);
	const [fileThumbnailList, setFileThumbnailList] = useState([]);
	const [datasetThumbnailList, setDatasetThumbnailList] = useState([]);
	const [lastDataset, setLastDataset] = useState([]);
	const [firstDataset, setFirstDataset] = useState([]);
	const [limit,] = useState(5);

	const [paths, setPaths] = useState([]);

	// component did mount
	useEffect(() => {
		listDatasets(null, null, limit);
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

				// find last and first dataset for pagination
				setFirstDataset(datasets[0])
				setLastDataset(datasets[datasets.length - 1]);

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

	// for breadcrumbs
	useEffect(() => {
		if (datasetAbout !== undefined && datasetAbout["name"] !== undefined){
			setSelectedDatasetName(datasetAbout["name"]);
			setPaths([
				{
					"name":datasetAbout["name"],
					"id": selectedDatasetId,
					"type":"dataset"
				}
			]);
		}
	}, [datasetAbout])

	useEffect(() => {
		fileMetadataList.map((fileMetadata) => {
			if (selectedFileId === fileMetadata["id"]) {
				if (fileMetadata !== undefined && fileMetadata["metadata"]["filename"] !== undefined) {
					setSelectedFilename(fileMetadata["metadata"]["filename"]);
					setPaths([
						{
							"name":selectedDatasetName,
							"id": selectedDatasetId,
							"type":"dataset"
						},
						{
							"name":fileMetadata["metadata"]["filename"],
							"id": selectedFileId,
							"type":"file"
						}
					]);
				}
			}
		});
	}, [selectedFileId])

	const previous = () => {
		let date = firstDataset["created"] !== undefined? new Date(firstDataset["created"]) : null;
		if (date) listDatasets("b", date.toISOString(), limit);
	}

	const next = () => {
		let date = lastDataset["created"] !== undefined? new Date(lastDataset["created"]) : null;
		if (date) listDatasets("a", date.toISOString(), limit);
	}

	const selectDataset = (selectedDatasetId) => {
		// pass that id to dataset component
		setSelectedDatasetId(selectedDatasetId);

		// load dataset information
		listFilesInDataset(selectedDatasetId);
		listDatasetAbout(selectedDatasetId);
	}

	const selectFile = (selectedFileId) => {
		// pass that id to file component
		setSelectedFileId(selectedFileId);

		// load file information
		listFileExtractedMetadata(selectedFileId);
		listFileMetadataJsonld(selectedFileId);
		listFilePreviews(selectedFileId);
	}

	const goToPath = (pathType, id) => {
		if (pathType === "dataset"){
			selectDataset(id);
			setSelectedFileId("");
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
							return <Dashboard datasets={datasets}
											  selectDataset={selectDataset}
											  thumbnails={datasetThumbnailList}
											  previous={previous}
											  next={next}
											  datasetSchema={datasetSchema}
											  deleteDataset={deleteDataset}
							/>
						} else if (selectedFileId === "") {
							return <Dataset files={filesInDataset}
											selectFile={selectFile}
											thumbnails={fileThumbnailList}
											about={datasetAbout}
											fileSchema={fileSchema}
											selectedDatasetId = {selectedDatasetId}
											selectDataset={selectDataset}
											deleteDataset={deleteDataset}
											deleteFile={deleteFile}
							/>
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
