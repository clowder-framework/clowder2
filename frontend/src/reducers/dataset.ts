import {
	CREATE_DATASET,
	DELETE_DATASET,
	RECEIVE_DATASET_ABOUT,
	RECEIVE_DATASET_ROLES,
	RECEIVE_DATASETS,
	RECEIVE_FILES_IN_DATASET,
	RECEIVE_FILES_IN_PUBLIC_DATASET,
	RECEIVE_PUBLIC_DATASETS,
	REMOVE_DATASET_GROUP_ROLE,
	REMOVE_DATASET_USER_ROLE,
	RESET_CREATE_DATASET,
	SET_DATASET_GROUP_ROLE,
	SET_DATASET_USER_ROLE,
	UPDATE_DATASET,
} from "../actions/dataset";
import {
	CREATE_FILE,
	CREATE_FILES,
	DELETE_FILE,
	RESET_CREATE_FILE,
	RESET_CREATE_FILES,
	UPDATE_FILE,
} from "../actions/file";
import { RECEIVE_DATASET_ROLE } from "../actions/authorization";
import { DataAction } from "../types/action";
import { DatasetState } from "../types/data";
import {
	AuthorizationBase,
	DatasetOut as Dataset,
	DatasetRoles,
	FileOut as File,
	UserOut,
} from "../openapi/v2";

const defaultState: DatasetState = {
	files: <File[]>[],
	about: <Dataset>{ creator: <UserOut>{} },
	datasetRole: <AuthorizationBase>{},
	datasets: [],
	newDataset: <Dataset>{},
	newFile: <File>{},
	newFiles: <File[]>[],
	roles: <DatasetRoles>{},
	publicDatasets: <Dataset>[],
};

const dataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_FILES_IN_DATASET:
			return Object.assign({}, state, { files: action.files });
		case RECEIVE_FILES_IN_PUBLIC_DATASET:
			return Object.assign({}, state, { files: action.files });
		case DELETE_FILE:
			return Object.assign({}, state, {
				files: state.files.filter((file) => file.id !== action.file.id),
			});
		case CREATE_FILE:
			return Object.assign({}, state, {
				newFile: action.file,
			});
		case CREATE_FILES:
			return Object.assign({}, state, {
				newFiles: action.files,
			});
		case RESET_CREATE_FILE:
			return Object.assign({}, state, { newFile: {} });
		case RESET_CREATE_FILES:
			return Object.assign({}, state, { newFiles: [] });
		case SET_DATASET_GROUP_ROLE:
			return Object.assign({}, state, {});
		case SET_DATASET_USER_ROLE:
			return Object.assign({}, state, {});
		case REMOVE_DATASET_GROUP_ROLE:
			return Object.assign({}, state, {});
		case REMOVE_DATASET_USER_ROLE:
			return Object.assign({}, state, {});
		case UPDATE_FILE:
			return Object.assign({}, state, {
				files: state.files.map((file) =>
					file.id === action.file.id ? action.file : file
				),
			});
		case RECEIVE_DATASET_ABOUT:
			return Object.assign({}, state, { about: action.about });
		case RECEIVE_DATASET_ROLE:
			return Object.assign({}, state, { datasetRole: action.role });
			return Object.assign({}, state, { datasetRole: action.role });
		case RECEIVE_DATASET_ROLES:
			return Object.assign({}, state, { roles: action.roles });
		case UPDATE_DATASET:
			return Object.assign({}, state, { about: action.about });
		case RECEIVE_DATASETS:
			return Object.assign({}, state, { datasets: action.datasets });
		case RECEIVE_PUBLIC_DATASETS:
			return Object.assign({}, state, {
				publicDatasets: action.publicDatasets,
			});
		case CREATE_DATASET:
			return Object.assign({}, state, { newDataset: action.dataset });
		case RESET_CREATE_DATASET:
			return Object.assign({}, state, { newDataset: {} });
		case DELETE_DATASET:
			return Object.assign({}, state, {
				datasets: state.datasets.filter(
					(dataset) => dataset.id !== action.dataset.id
				),
			});
		default:
			return state;
	}
};

export default dataset;
