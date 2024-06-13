import {
	DELETE_API_KEY,
	GENERATE_API_KEY,
	GET_ADMIN_MODE_STATUS,
	LIST_API_KEYS,
	LOGIN_ERROR,
	RECEIVE_USER_PROFILE,
	REGISTER_ERROR,
	REGISTER_USER,
	RESET_API_KEY,
	SET_USER,
	TOGGLE_ADMIN_MODE,
} from "../actions/user";
import { UserState } from "../types/data";
import { DataAction } from "../types/action";
import { Paged, PageMetadata, UserAPIKeyOut, UserOut } from "../openapi/v2";

const defaultState: UserState = {
	Authorization: null,
	loginError: false,
	adminMode: false,
	registerSucceeded: false,
	errorMsg: "",
	hashedKey: "",
	apiKeys: <Paged>{ metadata: <PageMetadata>{}, data: <UserAPIKeyOut[]>[] },
	deletedApiKey: <UserAPIKeyOut>{},
	profile: <UserOut>{},
};

const user = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case TOGGLE_ADMIN_MODE:
			return Object.assign({}, state, {
				adminMode: action.adminMode,
			});
		case GET_ADMIN_MODE_STATUS:
			return Object.assign({}, state, {
				adminMode: action.adminMode,
			});
		case SET_USER:
			return Object.assign({}, state, {
				Authorization: action.Authorization,
				loginError: false,
			});
		case RECEIVE_USER_PROFILE:
			return Object.assign({}, state, {
				profile: action.profile,
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
		case LIST_API_KEYS:
			return Object.assign({}, state, { apiKeys: action.apiKeys });
		case DELETE_API_KEY:
			return Object.assign({}, state, {
				deletedApiKey: action.apiKey,
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
