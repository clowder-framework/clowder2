import {V2} from "../openapi";
import {handleErrors} from "./common";

export const FOLDER_ADDED = "FOLDER_ADDED";
export function folderAdded(datasetId, adminMode, folderName, parentFolder = null){
	return (dispatch) => {
		const folder = {"name": folderName, "parent_folder": parentFolder}
		return V2.DatasetsService.addFolderApiV2DatasetsDatasetIdFoldersPost(datasetId, folder, adminMode)
			.then(json => {
				dispatch({
					type: FOLDER_ADDED,
					folder: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, folderAdded(datasetId, adminMode, folderName, parentFolder)));
			});
	};
}

export const GET_FOLDER_PATH = "GET_FOLDER_PATH";
export function fetchFolderPath(folderId){
	return (dispatch) => {
		if (folderId != null) {
			return V2.FoldersService.downloadFolderApiV2FoldersFolderIdPathGet(folderId)
				.then(json => {
					dispatch({
						type: GET_FOLDER_PATH,
						folderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch(reason => {
					dispatch(handleErrors(reason, fetchFolderPath(folderId)));
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

export const FOLDER_DELETED = "FOLDER_DELETED";
export function folderDeleted(datasetId, folderId){
	return (dispatch) => {
		return V2.DatasetsService.deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(datasetId, folderId)
			.then(json => {
				dispatch({
					type: FOLDER_DELETED,
					folder: {"id":folderId},
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, folderDeleted(datasetId, folderId)));
			});
	};
}
