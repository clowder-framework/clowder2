import { DataAction } from "../types/action";
import {
	FAILED,
	FAILED_INLINE,
	NOT_AUTHORIZED,
	NOT_FOUND,
	NOT_FOUND_INLINE,
	RESET_FAILED,
	RESET_FAILED_INLINE,
	RESET_LOGOUT,
} from "../actions/common";
import { LOGOUT } from "../actions/user";

const defaultState = {
	origin: "/",
	reason: "",
	reasonInline: "",
	stackInine: "",
	loggedOut: false,
};

const error = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case FAILED:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case FAILED_INLINE:
			return Object.assign({}, state, {
				reasonInline: action.reason,
				stackInline: action.stack,
			});
		case NOT_FOUND:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case NOT_FOUND_INLINE:
			return Object.assign({}, state, {
				reasonInline: action.reason,
				stackInline: action.stack,
			});
		case NOT_AUTHORIZED:
			return Object.assign({}, state, {
				reason: action.reason,
				stack: action.stack,
			});
		case RESET_FAILED:
			return Object.assign({}, state, { reason: "", stack: "" });
		case RESET_FAILED_INLINE:
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
