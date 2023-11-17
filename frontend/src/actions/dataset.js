import { V2 } from "../openapi";
import {
	handleErrors,
	handleErrorsAuthorization,
	handleErrorsInline,
	resetFailedReason,
} from "./common";

export const SET_DATASET_GROUP_ROLE = "SET_DATASET_GROUP_ROLE";

export function setDatasetGroupRole(datasetId, groupId, roleType, adminMode) {
	return (dispatch) => {
		return V2.AuthorizationService.setDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdRolePost(
			datasetId,
			groupId,
			roleType,
			adminMode
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
						setDatasetGroupRole(datasetId, groupId, roleType, adminMode)
					)
				);
			});
	};
}

export const SET_DATASET_USER_ROLE = "SET_DATASET_USER_ROLE";

export function setDatasetUserRole(datasetId, username, roleType, adminMode) {
	return (dispatch) => {
		return V2.AuthorizationService.setDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameRolePost(
			datasetId,
			username,
			roleType,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: SET_DATASET_USER_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrorsInline(
						reason,
						setDatasetUserRole(datasetId, username, roleType, adminMode)
					)
				);
			});
	};
}

export const REMOVE_DATASET_GROUP_ROLE = "REMOVE_DATASET_GROUP_ROLE";

export function removeDatasetGroupRole(datasetId, groupId, adminMode) {
	return (dispatch) => {
		return V2.AuthorizationService.removeDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdDelete(
			datasetId,
			groupId,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: REMOVE_DATASET_GROUP_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, removeDatasetGroupRole(datasetId, groupId, adminMode))
				);
			});
	};
}

export const REMOVE_DATASET_USER_ROLE = "REMOVE_DATASET_USER_ROLE";

export function removeDatasetUserRole(datasetId, username, adminMode) {
	return (dispatch) => {
		return V2.AuthorizationService.removeDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameDelete(
			datasetId,
			username,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: REMOVE_DATASET_GROUP_ROLE,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, removeDatasetUserRole(datasetId, username, adminMode))
				);
			});
	};
}

export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";

export function fetchFilesInDataset(datasetId, folderId, skip, limit, adminMode) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
			datasetId,
			adminMode,
			folderId,
			skip,
			limit)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILES_IN_DATASET,
					files: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchFilesInDataset(datasetId, adminMode, folderId, skip, limit, adminMode))
				);
			});
	};
}

export const RECEIVE_FOLDERS_IN_DATASET = "RECEIVE_FOLDERS_IN_DATASET";

export function fetchFoldersInDataset(datasetId, parentFolder, skip, limit, adminMode) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
			datasetId,
			adminMode,
			parentFolder,
			skip,
			limit
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
					handleErrors(reason, fetchFoldersInDataset(datasetId, parentFolder, skip, limit, adminMode))
				);
			});
	};
}

export const SUBMIT_DATASET_EXTRACTION = "SUBMIT_DATASET_EXTRACTION";

export function submitDatasetExtractionAction(
	datasetId,
	extractorName,
	adminMode,
	requestBody
) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
			datasetId,
			extractorName,
			adminMode,
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
						submitDatasetExtractionAction(datasetId, extractorName,adminMode, requestBody)
					)
				);
			});
	};
}

export const UPDATE_DATASET = "UPDATE_DATASET";

export function updateDataset(datasetId, formData, adminMode) {
	return (dispatch) => {
		return V2.DatasetsService.patchDatasetApiV2DatasetsDatasetIdPatch(
			datasetId,
			formData,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: UPDATE_DATASET,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, updateDataset(datasetId, formData, adminMode)));
			});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";

export function fetchDatasetAbout(id, adminMode) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id, adminMode)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_ABOUT,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasetAbout(id, adminMode)));
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";

export function fetchDatasets(skip = 0, limit = 21, mine = false, adminMode = false) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(adminMode, skip, limit, mine)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASETS,
					datasets: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasets(skip, limit, mine, adminMode)));
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

export function datasetDeleted(datasetId, adminMode) {
	return (dispatch) => {
		return V2.DatasetsService.deleteDatasetApiV2DatasetsDatasetIdDelete(
			datasetId,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: DELETE_DATASET,
					dataset: { id: datasetId },
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, datasetDeleted(datasetId, adminMode)));
			});
	};
}

export const FOLDER_ADDED = "FOLDER_ADDED";

export function folderAdded(datasetId, adminMode, folderName, parentFolder = null) {
	return (dispatch) => {
		const folder = { name: folderName, parent_folder: parentFolder };
		return V2.DatasetsService.addFolderApiV2DatasetsDatasetIdFoldersPost(
			datasetId,
			adminMode,
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
					handleErrors(reason, folderAdded(datasetId, adminMode, folderName, parentFolder))
				);
			});
	};
}

export const GET_FOLDER_PATH = "GET_FOLDER_PATH";

export function fetchFolderPath(folderId, adminMode) {
	return (dispatch) => {
		if (folderId != null) {
			return V2.FoldersService.downloadFolderApiV2FoldersFolderIdPathGet(
				folderId,
				adminMode
			)
				.then((json) => {
					dispatch({
						type: GET_FOLDER_PATH,
						folderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(handleErrors(reason, fetchFolderPath(folderId, adminMode)));
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

export function fetchDatasetRoles(datasetId, adminMode) {
	return (dispatch) => {
		console.log("adminMode: ", adminMode);
		return V2.AuthorizationService.getDatasetRolesApiV2AuthorizationsDatasetsDatasetIdRolesGet(
			datasetId,
			adminMode
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
					handleErrorsAuthorization(reason, fetchDatasetRoles(datasetId, adminMode))
				);
			});
	};
}
