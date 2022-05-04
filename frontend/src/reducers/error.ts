import {DataAction} from "../types/action";

const defaultState = {
	reason: "",
	stack: "",
	loggedOut: false,
};

const error = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case "FAILED":
			return Object.assign({}, state, {reason: action.reason, stack: action.stack});
		case "RESET_FAILED":
			return Object.assign({}, state, {reason: "", stack: ""});
		case "LOGOUT":
			return Object.assign({}, state, {loggedOut: true});
		case "RESET_LOGOUT":
			return Object.assign({}, state, {loggedOut: false});
		default:
			return state;
	}
};

export default error;
