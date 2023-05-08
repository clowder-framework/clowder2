import { V2 } from "../openapi";
import {
	handleErrors,
	handleErrorsAuthorization,
	resetFailedReason,
} from "./common";
import config from "../app.config";
import { getHeader, renameIdArray } from "../utils/common";

export const SET_DATASET_GROUP_ROLE = "SET_DATASET_GROUP_ROLE";

export function setDatasetGroupRole(datasetId, groupId, roleType) {
	return (dispatch) => {
		return V2.AuthorizationService.setDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdRolePost(
			datasetId,
			groupId,
			roleType
		)
			.then((json) => {
				dispatch({
					type: SET_DATASET_GROUP_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						setDatasetGroupRole(datasetId, groupId, roleType)
					)
				);
			});
	};
}

export const SET_DATASET_USER_ROLE = "SET_DATASET_USER_ROLE";

export function setDatasetUserRole(datasetId, username, roleType) {
	return (dispatch) => {
		return V2.AuthorizationService.setDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameRolePost(
			datasetId,
			username,
			roleType
		)
			.then((json) => {
				dispatch({
					type: SET_DATASET_USER_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						setDatasetUserRole(datasetId, username, roleType)
					)
				);
			});
	};
}

export const REMOVE_DATASET_GROUP_ROLE = "REMOVE_DATASET_GROUP_ROLE";

export function removeDatasetGroupRole(datasetId, groupId) {
	return (dispatch) => {
		return V2.AuthorizationService.removeDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdDelete(
			datasetId,
			groupId
		)
			.then((json) => {
				dispatch({
					type: REMOVE_DATASET_GROUP_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, removeDatasetGroupRole(datasetId, groupId))
				);
			});
	};
}

export const REMOVE_DATASET_USER_ROLE = "REMOVE_DATASET_USER_ROLE";

export function removeDatasetUserRole(datasetId, username) {
	return (dispatch) => {
		return V2.AuthorizationService.removeDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameDelete(
			datasetId,
			username
		)
			.then((json) => {
				dispatch({
					type: REMOVE_DATASET_GROUP_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, removeDatasetUserRole(datasetId, username))
				);
			});
	};
}

export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";

export function fetchFilesInDataset(datasetId, folderId) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
			datasetId,
			folderId
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILES_IN_DATASET,
					files: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchFilesInDataset(datasetId, folderId))
				);
			});
	};
}

export const RECEIVE_FOLDERS_IN_DATASET = "RECEIVE_FOLDERS_IN_DATASET";

export function fetchFoldersInDataset(datasetId, parentFolder) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
			datasetId,
			parentFolder
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FOLDERS_IN_DATASET,
					folders: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchFoldersInDataset(datasetId, parentFolder))
				);
			});
	};
}

export const SUBMIT_DATASET_EXTRACTION = "SUBMIT_DATASET_EXTRACTION";

export function submitDatasetExtractionAction(
	datasetId,
	extractorName,
	requestBody
) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
			datasetId,
			extractorName,
			requestBody
		)
			.then((json) => {
				dispatch({
					type: SUBMIT_DATASET_EXTRACTION,
					job_id: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						submitDatasetExtractionAction(datasetId, extractorName, requestBody)
					)
				);
			});
	};
}

export const UPDATE_DATASET = "UPDATE_DATASET";

export function updateDataset(datasetId, formData) {
	return (dispatch) => {
		return V2.DatasetsService.patchDatasetApiV2DatasetsDatasetIdPatch(
			datasetId,
			formData
		)
			.then((json) => {
				dispatch({
					type: UPDATE_DATASET,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, updateDataset(datasetId, formData)));
			});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";

export function fetchDatasetAbout(id) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_ABOUT,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasetAbout(id)));
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";

export function fetchDatasets(skip = 0, limit = 21, mine = false) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(skip, limit, mine)
			.then((json) => {
				// FIXME temporary workaround to map from `_id` returned by API to `id` expected by javascript
				const newArray = renameIdArray(json);
				dispatch({
					type: RECEIVE_DATASETS,
					datasets: newArray,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasets(skip, limit, mine)));
			});
	};
}

export const CREATE_DATASET = "CREATE_DATASET";

export function datasetCreated(formData) {
	return (dispatch) => {
		return V2.DatasetsService.saveDatasetApiV2DatasetsPost(formData)
			.then((dataset) => {
				dispatch({
					type: CREATE_DATASET,
					dataset: dataset,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, datasetCreated(formData)));
			});
	};
}

export const RESET_CREATE_DATASET = "RESET_CREATE_DATASET";

export function resetDatsetCreated() {
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_DATASET,
			receivedAt: Date.now(),
		});
	};
}

export const DELETE_DATASET = "DELETE_DATASET";

export function datasetDeleted(datasetId) {
	return (dispatch) => {
		return V2.DatasetsService.deleteDatasetApiV2DatasetsDatasetIdDelete(
			datasetId
		)
			.then((json) => {
				dispatch({
					type: DELETE_DATASET,
					dataset: { id: datasetId },
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, datasetDeleted(datasetId)));
			});
	};
}

export const FOLDER_ADDED = "FOLDER_ADDED";

export function folderAdded(datasetId, folderName, parentFolder = null) {
	return (dispatch) => {
		const folder = { name: folderName, parent_folder: parentFolder };
		return V2.DatasetsService.addFolderApiV2DatasetsDatasetIdFoldersPost(
			datasetId,
			folder
		)
			.then((json) => {
				dispatch({
					type: FOLDER_ADDED,
					folder: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, folderAdded(datasetId, folderName, parentFolder))
				);
			});
	};
}

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
		} else {
			dispatch({
				type: GET_FOLDER_PATH,
				folderPath: [],
				receivedAt: Date.now(),
			});
		}
	};
}

export const RECEIVE_DATASET_ROLES = "RECEIVE_DATASET_ROLES";

export function fetchDatasetRoles(datasetId) {
	return (dispatch) => {
		return V2.AuthorizationService.getDatasetRolesApiV2AuthorizationsDatasetsDatasetIdRolesGet(
			datasetId
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_ROLES,
					roles: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(reason, fetchDatasetRoles(datasetId))
				);
			});
	};
}

export const DOWNLOAD_DATASET = "DOWNLOAD_DATASET";

export function datasetDownloaded(datasetId, filename = "") {
	return async (dispatch) => {
		if (filename !== "") {
			filename = filename.replace(/\s+/g, "_");
			filename = `${filename}.zip`;
		} else {
			filename = `${datasetId}.zip`;
		}
		const endpoint = `${config.hostname}/api/v2/datasets/${datasetId}/download`;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
			headers: await getHeader(),
		});

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
		} else {
			dispatch(handleErrors(response, datasetDownloaded(datasetId, filename)));
		}
	};
}
