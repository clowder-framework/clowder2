import {V2} from "../openapi";
import {handleErrors} from "./common";
import config from "../app.config";
import {getHeader} from "../utils/common";

export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";
export function fetchFilesInDataset(datasetId, folderId){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFilesApiV2DatasetsDatasetIdFilesGet(datasetId, folderId)
			.then(json => {
				dispatch({
					type: RECEIVE_FILES_IN_DATASET,
					files: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFilesInDataset(datasetId, folderId)));
			});
	};
}

export const RECEIVE_FOLDERS_IN_DATASET = "RECEIVE_FOLDERS_IN_DATASET";
export function fetchFoldersInDataset(datasetId, parentFolder){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(datasetId, parentFolder)
			.then(json => {
				dispatch({
					type: RECEIVE_FOLDERS_IN_DATASET,
					folders: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFoldersInDataset(datasetId, parentFolder)));
			});
	};
}

export const UPDATE_DATASET = "UPDATE_DATASET";
export function updateDataset(datasetId, formData){
	return (dispatch) => {
		return V2.DatasetsService.patchDatasetApiV2DatasetsDatasetIdPatch(datasetId, formData)
			.then(json => {
				dispatch({
					type: UPDATE_DATASET,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, updateDataset(datasetId, formData)));
			});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";
export function fetchDatasetAbout(id){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id)
			.then(json => {
				dispatch({
					type: RECEIVE_DATASET_ABOUT,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchDatasetAbout(id)));
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
export function fetchDatasets(skip=0, limit=21, mine=false){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(skip, limit, mine)
			.then(json => {
				dispatch({
					type: RECEIVE_DATASETS,
					datasets: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchDatasets(skip, limit, mine)));
			});

	};
}

export const CREATE_DATASET = "CREATE_DATASET";
export function datasetCreated(formData){
	return (dispatch) =>{
		return V2.DatasetsService.saveDatasetApiV2DatasetsPost(formData)
			.then(dataset => {
				dispatch({
					type: CREATE_DATASET,
					dataset: dataset,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, datasetCreated(formData)));
			});
	};
}

export const RESET_CREATE_DATASET = "RESET_CREATE_DATASET";
export function resetDatsetCreated(){
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_DATASET,
			receivedAt: Date.now(),
		});
	};
}

export const DELETE_DATASET = "DELETE_DATASET";
export function datasetDeleted(datasetId){
	return (dispatch) => {
		return V2.DatasetsService.deleteDatasetApiV2DatasetsDatasetIdDelete(datasetId)
			.then(json => {
				dispatch({
					type: DELETE_DATASET,
					dataset: {"id": datasetId},
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, datasetDeleted(datasetId)));
			});
	};
}

export const DOWNLOAD_DATASET = "DOWNLOAD_DATASET";
export function datasetDownloaded(datasetId, filename = "") {
	return async (dispatch) =>{
		if (filename !== "") {
			filename = filename.replace(/\s+/g, "_");
			filename = `${filename}.zip`;
		} else {
			filename = `${datasetId}.zip`;
		}
		const endpoint = `${config.hostname}/api/v2/datasets/${datasetId}/download`;
		const response = await fetch(endpoint, {method: "GET", mode: "cors", headers: await getHeader()});

		if (response.status === 200) {
			const blob = await response.blob();
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, filename);
			} else {
				const anchor = window.document.createElement("a");
				anchor.href = window.URL.createObjectURL(blob);
				anchor.download = filename;
				document.body.appendChild(anchor);
				anchor.click();
				document.body.removeChild(anchor);
			}
			dispatch({
				type: DOWNLOAD_DATASET,
				receivedAt: Date.now(),
			});
		}
		else {
			dispatch(handleErrors(response, datasetDownloaded(datasetId, filename)));
		}
	};
}
