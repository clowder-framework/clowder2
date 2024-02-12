import { V2 } from "../openapi";
import { handleErrors } from "./common";

export const GET_FOLDER_PATH = "GET_FOLDER_PATH";

export function fetchFolderPath(folderId) {
	return (dispatch) => {
		if (folderId != null) {
			return V2.FoldersService.downloadFolderApiV2FoldersFolderIdPathGet(
				folderId
			)
				.then((json) => {
					dispatch({
						type: GET_FOLDER_PATH,
						folderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(handleErrors(reason, fetchFolderPath(folderId)));
				});
		}
	};
}

export const GET_PUBLIC_FOLDER_PATH = "GET_PUBLIC_FOLDER_PATH";

export function fetchPublicFolderPath(folderId) {
	return (dispatch) => {
		if (folderId != null) {
			return V2.PublicFoldersService.downloadFolderApiV2PublicFoldersFolderIdPathGet(
				folderId
			)
				.then((json) => {
					dispatch({
						type: GET_PUBLIC_FOLDER_PATH,
						publicFolderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(handleErrors(reason, fetchPublicFolderPath(folderId)));
				});
		}
	};
}

export const FOLDER_DELETED = "FOLDER_DELETED";

export function folderDeleted(datasetId, folderId) {
	return (dispatch) => {
		return V2.DatasetsService.deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(
			datasetId,
			folderId
		)
			.then((json) => {
				dispatch({
					type: FOLDER_DELETED,
					folder: { id: folderId },
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, folderDeleted(datasetId, folderId)));
			});
	};
}
