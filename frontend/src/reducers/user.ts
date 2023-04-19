import {
	GENERATE_API_KEY,
	LOGIN_ERROR,
	REGISTER_ERROR,
	REGISTER_USER,
	RESET_API_KEY,
	SET_USER,
} from "../actions/user";
import { UserState } from "../types/data";
import { DataAction } from "../types/action";

const defaultState: UserState = {
	Authorization: null,
	loginError: false,
	registerSucceeded: false,
	errorMsg: "",
	apiKey: "",
};

const user = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case SET_USER:
			return Object.assign({}, state, {
				Authorization: action.Authorization,
				loginError: false,
			});
		case LOGIN_ERROR:
			return Object.assign({}, state, {
				Authorization: null,
				loginError: true,
				errorMsg: action.errorMsg,
			});
		case REGISTER_USER:
			return Object.assign({}, state, { registerSucceeded: true });
		case REGISTER_ERROR:
			return Object.assign({}, state, {
				registerSucceeded: false,
				errorMsg: action.errorMsg,
			});
		case GENERATE_API_KEY:
			return Object.assign({}, state, { apiKey: action.apiKey });
		case RESET_API_KEY:
			return Object.assign({}, state, { apiKey: "" });
		default:
			return state;
	}
};

export default user;
