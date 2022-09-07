import {FOLDER_DELETED} from "../actions/folder";
import {DataAction} from "../types/action";
import {FolderState} from "../types/data";

const defaultState: FolderState = {
	folders: [],
};

const folder = (state = defaultState, action: DataAction) => {
	switch (action.type) {
	case FOLDER_DELETED:
		return Object.assign({}, state, {
			folders: state.folders.filter(folder => folder.id !== action.folder.id),
		});
	default:
		return state;
	}
};

export default folder;
