import { DataAction } from "../types/action";
import {
	FAILED,
	NOT_AUTHORIZED,
	NOT_FOUND,
	RESET_FAILED,
	RESET_LOGOUT,
} from "../actions/common";
import { LOGOUT } from "../actions/user";

const defaultState = {
	origin: "/",
	reason: "",
	stack: "",
	loggedOut: false,
};

const error = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case FAILED:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case NOT_FOUND:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case NOT_AUTHORIZED:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case RESET_FAILED:
			return Object.assign({}, state, { reason: "", stack: "" });
		case LOGOUT:
			return Object.assign({}, state, { loggedOut: true });
		case RESET_LOGOUT:
			return Object.assign({}, state, { loggedOut: false });
		default:
			return state;
	}
};

export default error;
