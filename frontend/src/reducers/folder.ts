import { GET_FOLDER_PATH, GET_PUBLIC_FOLDER_PATH } from "../actions/folder";
import { DataAction } from "../types/action";
import { FolderState } from "../types/data";
import { RECEIVE_FOLDERS_IN_PUBLIC_DATASET } from "../actions/public_dataset";

const defaultState: FolderState = {
	folderPath: [],
	publicFolders: [],
	publicFolderPath: [],
};

const folder = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case GET_FOLDER_PATH:
			return Object.assign({}, state, {
				folderPath: action.folderPath,
			});
		case GET_PUBLIC_FOLDER_PATH:
			return Object.assign({}, state, {
				publicFolderPath: action.publicFolderPath,
			});
		case RECEIVE_FOLDERS_IN_PUBLIC_DATASET:
			return Object.assign({}, state, { publicFolders: action.publicFolders });
		default:
			return state;
	}
};

export default folder;
