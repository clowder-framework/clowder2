import {RECEIVE_EXTRACTORS} from "../actions/extractors";
import {DataAction} from "../types/action";
import {FolderState} from "../types/data";

const defaultState = {
	extractors: []
};

const extractors = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_EXTRACTORS:
			return Object.assign({}, state, {extractors: action.extractors});
		default:
			return state;
	}
};

export default extractors;
