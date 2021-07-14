import { RECEIVE_FILE_METADATA } from "../actions/file";

const defaultState = {file: []};

const file = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {file: action.file});
		default:
			return state;
	}
};

export default file;
