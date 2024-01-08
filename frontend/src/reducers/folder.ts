import {
	FOLDER_DELETED,
	FOLDER_ADDED,
	GET_FOLDER_PATH,
} from "../actions/folder";
import { DataAction } from "../types/action";
import { FolderState } from "../types/data";
import { RECEIVE_FOLDERS_IN_DATASET } from "../actions/dataset";

const defaultState: FolderState = {
	folders: [],
	folderPath: [],
};

const folder = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case FOLDER_DELETED:
			return Object.assign({}, state, {
				folders: state.folders.filter(
					(folder) => folder.id !== action.folder.id
				),
			});
		case FOLDER_ADDED:
			return Object.assign({}, state, {
				folders: [...state.folders, action.folder],
			});
		case GET_FOLDER_PATH:
			return Object.assign({}, state, {
				folderPath: action.folderPath,
			});
		case RECEIVE_FOLDERS_IN_DATASET:
			return Object.assign({}, state, { folders: action.folders });
		default:
			return state;
	}
};

export default folder;
