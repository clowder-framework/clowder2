import {
	DELETE_API_KEY,
	GENERATE_API_KEY,
	LIST_API_KEYS,
	LOGIN_ERROR, RECEIVE_USER_PROFILE,
	REGISTER_ERROR,
	REGISTER_USER,
	RESET_API_KEY,
	SET_USER,
} from "../actions/user";
import {Author, Dataset, UserState} from "../types/data";
import { DataAction } from "../types/action";

const defaultState: UserState = {
	Authorization: null,
	loginError: false,
	registerSucceeded: false,
	errorMsg: "",
	hashedKey: "",
	apiKeys: [],
	profile: null,
};

const user = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case SET_USER:
			return Object.assign({}, state, {
				Authorization: action.Authorization,
				loginError: false,
			});
		case RECEIVE_USER_PROFILE:
			return Object.assign({}, state, {
				profile: action.profile,
				loginError:false,
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
		case LIST_API_KEYS:
			return Object.assign({}, state, { apiKeys: action.apiKeys });
		case DELETE_API_KEY:
			return Object.assign({}, state, {
				apiKeys: state.apiKeys.filter(
					(apikey) => apikey.id !== action.apiKey.id
				),
			});
		case GENERATE_API_KEY:
			return Object.assign({}, state, { hashedKey: action.hashedKey });
		case RESET_API_KEY:
			return Object.assign({}, state, { hashedKey: "" });
		default:
			return state;
	}
};

export default user;
