import {DataAction} from "../types/action";

const defaultState = {
	reason: "",
	loggedOut: false,
};

const error = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case "FAILED":
			return Object.assign({}, state, {reason: action.reason});
		case "RESET_FAILED":
			return Object.assign({}, state, {reason: action.reason});
		case "LOGOUT":
			return Object.assign({}, state, {loggedOut: true});
		case "RESET_LOGOUT":
			return Object.assign({}, state, {loggedOut: false});
		default:
			return state;
	}
};

export default error;
