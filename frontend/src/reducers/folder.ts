import {
	FOLDER_ADDED,
	FOLDER_DELETED,
	GET_FOLDER_PATH,
	GET_PUBLIC_FOLDER_PATH,
} from "../actions/folder";
import { DataAction } from "../types/action";
import { FolderState } from "../types/data";
import {
	RECEIVE_FOLDERS_IN_DATASET,
	RESET_FOLDERS_IN_DATASET,
} from "../actions/dataset";
import { RECEIVE_FOLDERS_IN_PUBLIC_DATASET } from "../actions/public_dataset";
import { FolderOut, Paged, PageMetadata } from "../openapi/v2";

const defaultState: FolderState = {
	folders: <Paged>{ metadata: <PageMetadata>{}, data: <FolderOut[]>[] },
	newFolder: <FolderOut>{},
	folderPath: [],
	publicFolders: [],
	publicFolderPath: [],
};

const folder = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case FOLDER_DELETED:
			return Object.assign({}, state, {
				folders: {
					...state.folders,
					data: state.folders.data.filter(
						(folder: FolderOut) => folder.id !== action.folder.id
					),
				},
			});
		case FOLDER_ADDED:
			return Object.assign({}, state, { newFolder: action.folder });
		case GET_FOLDER_PATH:
			return Object.assign({}, state, {
				folderPath: action.folderPath,
			});
		case GET_PUBLIC_FOLDER_PATH:
			return Object.assign({}, state, {
				publicFolderPath: action.publicFolderPath,
			});
		case RECEIVE_FOLDERS_IN_DATASET:
			return Object.assign({}, state, { folders: action.folders });
		case RESET_FOLDERS_IN_DATASET:
			return Object.assign({}, state, {
				folders: <Paged>{ metadata: <PageMetadata>{}, data: <FolderOut[]>[] },
			});
		case RECEIVE_FOLDERS_IN_PUBLIC_DATASET:
			return Object.assign({}, state, { publicFolders: action.publicFolders });
		default:
			return state;
	}
};

export default folder;
