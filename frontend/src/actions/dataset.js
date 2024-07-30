import { V2 } from "../openapi";
import {
	handleErrors,
	handleErrorsAuthorization,
	handleErrorsInline,
	resetFailedReason,
} from "./common";

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
					handleErrorsInline(
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

export const RECEIVE_FOLDERS_FILES_IN_DATASET =
	"RECEIVE_FOLDERS_FILES_IN_DATASET";

export function fetchFoldersFilesInDataset(datasetId, folderId, skip, limit) {
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFoldersAndFilesApiV2DatasetsDatasetIdFoldersAndFilesGet(
			datasetId,
			folderId,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FOLDERS_FILES_IN_DATASET,
					foldersAndFiles: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchFoldersFilesInDataset(datasetId, folderId, skip, limit)
					)
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
			null,
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

export const FREEZE_DATASET = "FREEZE_DATASET";

export function freezeDataset(datasetId, publishDOI = false) {
	return (dispatch) => {
		return V2.DatasetsService.freezeDatasetApiV2DatasetsDatasetIdFreezePost(
			datasetId,
			publishDOI
		)
			.then((json) => {
				dispatch({
					type: FREEZE_DATASET,
					newFrozenDataset: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(handleErrorsAuthorization(reason, freezeDataset(datasetId)));
			});
	};
}

export const GET_FREEZE_DATASET_LATEST_VERSION_NUM =
	"GET_FREEZE_DATASET_LATEST_VERSION_NUM";

export function getFreezeDatasetLatest(datasetId) {
	return (dispatch) => {
		return V2.DatasetsService.getFreezeDatasetLastestVersionNumApiV2DatasetsDatasetIdFreezeLatestVersionNumGet(
			datasetId
		)
			.then((json) => {
				dispatch({
					type: GET_FREEZE_DATASET_LATEST_VERSION_NUM,
					latestFrozenVersionNum: json ?? -999,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(reason, getFreezeDatasetLatest(datasetId))
				);
			});
	};
}

export const GET_FREEZE_DATASET = "GET_FREEZE_DATASET";

export function getFreezeDataset(datasetId, frozenVersionNum) {
	return (dispatch) => {
		return V2.DatasetsService.getFreezeDatasetVersionApiV2DatasetsDatasetIdFreezeFrozenVersionNumGet(
			datasetId,
			frozenVersionNum
		)
			.then((json) => {
				dispatch({
					type: GET_FREEZE_DATASET,
					frozenDataset: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(
						reason,
						getFreezeDataset(datasetId, frozenVersionNum)
					)
				);
			});
	};
}

export const GET_FREEZE_DATASETS = "GET_FREEZE_DATASETS";

export function getFreezeDatasets(datasetId, skip = 0, limit = 21) {
	return (dispatch) => {
		return V2.DatasetsService.getFreezeDatasetsApiV2DatasetsDatasetIdFreezeGet(
			datasetId,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: GET_FREEZE_DATASETS,
					frozenDatasets: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(
						reason,
						getFreezeDatasets(datasetId, skip, limit)
					)
				);
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

export const DELETE_FREEZE_DATASET = "DELETE_FREEZE_DATASET";

export function deleteFreezeDataset(datasetId, frozenVersionNum) {
	return (dispatch) => {
		return V2.DatasetsService.deleteFreezeDatasetVersionApiV2DatasetsDatasetIdFreezeFrozenVersionNumDelete(
			datasetId,
			frozenVersionNum
		)
			.then((json) => {
				dispatch({
					type: DELETE_FREEZE_DATASET,
					frozenDataset: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(
						reason,
						deleteFreezeDataset(datasetId, frozenVersionNum)
					)
				);
			});
	};
}

export const RECEIVE_DATASET_LICENSE = "RECEIVE_DATASET_LICENSE";

export function fetchDatasetLicense(license_id) {
	return (dispatch) => {
		return V2.LicensesService.getLicenseApiV2LicensesLicenseIdGet(license_id)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_LICENSE,
					license: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasetLicense(license_id)));
			});
	};
}

export const UPDATE_DATASET_LICENSE = "UPDATE_DATASET_LICENSE";

export function updateDatasetLicense(licenseId, formData) {
	return (dispatch) => {
		return V2.LicensesService.editLicenseApiV2LicensesLicenseIdPut(
			licenseId,
			formData
		)
			.then((json) => {
				dispatch({
					type: UPDATE_DATASET_LICENSE,
					license: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, updateDatasetLicense(licenseId, formData))
				);
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";

export function fetchDatasets(skip = 0, limit = 21, mine = false) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(skip, limit, mine)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASETS,
					datasets: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasets(skip, limit, mine)));
			});
	};
}

export const RECEIVE_MY_DATASETS = "RECEIVE_MY_DATASETS";

export function fetchMyDatasets(skip = 0, limit = 21, mine = true) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(skip, limit, mine)
			.then((json) => {
				dispatch({
					type: RECEIVE_MY_DATASETS,
					datasets: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchMyDatasets(skip, limit, mine)));
			});
	};
}

export const CREATE_DATASET = "CREATE_DATASET";

export function datasetCreated(formData, licenseId, licenseFormData) {
	return (dispatch) => {
		if (licenseFormData) {
			// If licenseFormData is present, save the license first
			return V2.LicensesService.saveLicenseApiV2LicensesPost(licenseFormData)
				.then((license) => {
					licenseId = license.id;
					// After saving the license, save the dataset
					return V2.DatasetsService.saveDatasetApiV2DatasetsPost(
						licenseId,
						formData
					);
				})
				.then((dataset) => {
					dispatch({
						type: CREATE_DATASET,
						dataset: dataset,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(
						handleErrors(
							reason,
							datasetCreated(formData, licenseId, licenseFormData)
						)
					);
				});
		} else {
			// If licenseFormData is not present, directly save the dataset
			return V2.DatasetsService.saveDatasetApiV2DatasetsPost(
				licenseId,
				formData
			)
				.then((dataset) => {
					dispatch({
						type: CREATE_DATASET,
						dataset: dataset,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(
						handleErrors(
							reason,
							datasetCreated(formData, licenseId, licenseFormData)
						)
					);
				});
		}
	};
}

export function licenseCreated(formData) {
	try {
		return V2.LicensesService.saveLicenseApiV2LicensesPost(formData);
	} catch (reason) {
		handleErrors(reason, licenseCreated(formData));
	}
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

export const FOLDER_UPDATED = "FOLDER_UPDATED";

export function updateFolder(datasetId, folderId, formData) {
	return (dispatch) => {
		return V2.DatasetsService.patchFolderApiV2DatasetsDatasetIdFoldersFolderIdPatch(
			datasetId,
			folderId,
			formData
		)
			.then((json) => {
				dispatch({
					type: FOLDER_UPDATED,
					folder: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, updateFolder(datasetId, folderId, formData))
				);
			});
	};
}

export const GET_FOLDER = "GET_FOLDER";

export function getFolder(datasetId, folderId) {
	return (dispatch) => {
		return V2.DatasetsService.getFolderApiV2DatasetsDatasetIdFoldersFolderIdGet(
			datasetId,
			folderId
		)
			.then((json) => {
				dispatch({
					type: GET_FOLDER,
					folder: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getFolder(datasetId, folderId)));
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

export const INCREMENT_DATASET_DOWNLOADS = "INCREMENT_DATASET_DOWNLOADS";
