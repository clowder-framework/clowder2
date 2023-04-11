import {
	RECEIVE_FILES_IN_DATASET,
	RECEIVE_DATASET_ABOUT,
	UPDATE_DATASET,
	RECEIVE_DATASETS,
	DELETE_DATASET,
	CREATE_DATASET,
	RESET_CREATE_DATASET,
	DOWNLOAD_DATASET,
	SET_DATASET_GROUP_ROLE,
    SET_DATASET_USER_ROLE,
	RECEIVE_DATASET_ROLES,
	RECEIVE_DATASET_USERS_AND_ROLES,
	RECEIVE_DATASET_GROUPS_AND_ROLES,
} from "../actions/dataset";
import {CREATE_FILE, UPDATE_FILE, DELETE_FILE, RESET_CREATE_FILE} from "../actions/file";
import {RECEIVE_DATASET_ROLE,
} from "../actions/authorization";
import {DataAction} from "../types/action";
import {Author, Dataset, DatasetState} from "../types/data";
import {AuthorizationBase, GroupAndRole,  UserAndRole, FileOut as File} from "../openapi/v2";

const defaultState: DatasetState = {
	files: <File[]>[],
	about: <Dataset>{"author":<Author>{}},
	datasetRole: <AuthorizationBase>{},
	datasets: [],
	newDataset: <Dataset>{},
	newFile: <File>{},
	groupsAndRoles: <GroupAndRole[]>[],
	usersAndRoles: <UserAndRole[]>[],
};

const dataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
	case RECEIVE_FILES_IN_DATASET:
		return Object.assign({}, state, {files: action.files});
	case DELETE_FILE:
		return Object.assign({}, state, {
			files: state.files.filter(file => file.id !== action.file.id),
		});
	// TODO rethink the pattern for file creation
	// case CREATE_FILE:
	// 	return Object.assign({}, state, {
	// 		files: [...state.files, action.file]
	// 	});
	case CREATE_FILE:
		return Object.assign({}, state, {
			newFile: action.file
		});
	case RESET_CREATE_FILE:
		return Object.assign({}, state, {newFile: {}})
	case SET_DATASET_GROUP_ROLE:
		return Object.assign({}, state, {})
    case SET_DATASET_USER_ROLE:
        return Object.assign({}, state, {})
	case UPDATE_FILE:
		return Object.assign({}, state, {
			files: state.files.map(file => file.id === action.file.id ? action.file: file),
		});
	case RECEIVE_DATASET_ABOUT:
		return Object.assign({}, state, {about: action.about});
	case RECEIVE_DATASET_ROLE:
		return Object.assign({}, state, {datasetRole: action.role});
		return Object.assign({}, state, {datasetRole: action.role});
	case RECEIVE_DATASET_ROLES:
		return Object.assign({}, state, {groupsAndRoles: action.roles});
	case RECEIVE_DATASET_GROUPS_AND_ROLES:
		return Object.assign({}, state, {groupsAndRoles: action.groupsAndRoles});
	case RECEIVE_DATASET_USERS_AND_ROLES:
		return Object.assign({}, state, {usersAndRoles: action.usersAndRoles});
	case UPDATE_DATASET:
		return Object.assign({}, state, {about: action.about});
	case RECEIVE_DATASETS:
		return Object.assign({}, state, {datasets: action.datasets});
	case CREATE_DATASET:
		return Object.assign({}, state, {newDataset: action.dataset});
	case RESET_CREATE_DATASET:
			return Object.assign({}, state, {newDataset: {}});
	case DELETE_DATASET:
		return Object.assign({}, state, {
			datasets: state.datasets.filter(dataset => dataset.id !== action.dataset.id),
		});
	// case DOWNLOAD_DATASET:
	// 	// TODO do nothing for now; but in the future can utilize to display certain effects
	// 	return Object.assign({}, state, {});
	default:
		return state;
	}
};

export default dataset;
