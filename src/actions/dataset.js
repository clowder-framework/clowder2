import {V2} from "../openapi";
import {LOGOUT, logoutHelper} from "./user";
import {handleErrors} from "./common";

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
				dispatch(handleErrors(reason));
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
				dispatch(handleErrors(reason));
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
				dispatch(handleErrors(reason));
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
				dispatch(handleErrors(reason));
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
export function fetchDatasets(skip=0, limit=20, mine=false){
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
				dispatch(handleErrors(reason));
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
				dispatch(handleErrors(reason));
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
					dataset: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}


export const FOLDER_ADDED = "FOLDER_ADDED";
export function folderAdded(datasetId, folderName, parentFolder = null){
	return (dispatch) => {
		const folder = {"name": folderName, "parent_folder": parentFolder}
		return V2.DatasetsService.addFolderApiV2DatasetsDatasetIdFoldersPost(datasetId, folder)
			.then(json => {
				dispatch({
					type: FOLDER_ADDED,
					folder: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const GET_FOLDER_PATH = "GET_FOLDER_PATH";
export function fetchFolderPath(folderId){
	return (dispatch) => {
		if (folderId != null) {
			return V2.FoldersService.downloadFileApiV2FoldersFolderIdPathGet(folderId)
				.then(json => {
					dispatch({
						type: GET_FOLDER_PATH,
						folderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch(reason => {
					dispatch(handleErrors(reason));
				});
		} else {
			dispatch({
				type: GET_FOLDER_PATH,
				folderPath: [],
				receivedAt: Date.now(),
			});
		}
	};
}
