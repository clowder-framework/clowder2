import { V2 } from "../openapi";
import Cookies from "universal-cookie";
import config from "../app.config";
import { handleErrors } from "./common";

const cookies = new Cookies();

export async function loginHelper(
	email,
	password,
	first_name = null,
	last_name = null,
	register = false
) {
	const data = { email: email, password: password };
	if (register) {
		return V2.LoginService.saveUserApiV2UsersPost({
			...data,
			first_name: first_name,
			last_name: last_name,
		})
			.then((user) => {
				return user;
			})
			.catch((reason) => {
				// logout();
				return { errorMsg: `Failed to register a user! ${reason}` };
			});
	} else {
		return V2.LoginService.loginApiV2LoginPost(data)
			.then((user) => {
				return user;
			})
			.catch((reason) => {
				// logout();
				return { errorMsg: `Failed to login a user! ${reason}` };
			});
	}
}

export async function logoutHelper() {
	const headers = { Authorization: cookies.get("Authorization") };
	V2.OpenAPI.TOKEN = undefined;
	cookies.remove("Authorization", { path: "/" });
	return await fetch(config.KeycloakLogout, {
		method: "GET",
		headers: headers,
	});
}

export const LOGIN_ERROR = "LOGIN_ERROR";
export const SET_USER = "SET_USER";
export const REGISTER_USER = "REGISTER_USER";
export const REGISTER_ERROR = "REGISTER_ERROR";
export const LOGOUT = "LOGOUT";

export function _legacy_login(email, password) {
	return async (dispatch) => {
		const json = await loginHelper(email, password, false);
		V2.OpenAPI.TOKEN = undefined;
		cookies.remove("Authorization", { path: "/" });

		if (json["token"] !== undefined && json["token"] !== "none") {
			cookies.set("Authorization", `Bearer ${json["token"]}`, {
				path: "/",
			});
			V2.OpenAPI.TOKEN = json["token"];
			return dispatch({
				type: SET_USER,
				Authorization: `Bearer ${json["token"]}`,
			});
		} else {
			return dispatch({
				type: LOGIN_ERROR,
				errorMsg:
					json["errorMsg"] !== undefined && json["errorMsg"] !== ""
						? json["errorMsg"]
						: "Email/Password incorrect!",
			});
		}
	};
}

export function _legacy_register(email, password, firstname, lastname) {
	return async (dispatch) => {
		const json = await loginHelper(email, password, firstname, lastname, true);
		if (json["email"] !== undefined && json["hashed_password"] !== undefined) {
			return dispatch({
				type: REGISTER_USER,
			});
		} else {
			return dispatch({
				type: REGISTER_ERROR,
				errorMsg:
					json["errorMsg"] !== undefined && json["errorMsg"] !== ""
						? json["errorMsg"]
						: "Fail to register!",
			});
		}
	};
}

export function logout() {
	return (dispatch) => {
		logoutHelper();
		return dispatch({
			type: LOGOUT,
		});
	};
}

export const LIST_USERS = "LIST_USERS";

export function fetchAllUsers(skip = 0, limit = 101) {
	return (dispatch) => {
		return V2.UsersService.getUsersApiV2UsersGet(skip, limit)
			.then((json) => {
				dispatch({
					type: LIST_USERS,
					users: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(fetchAllUsers(skip, limit));
			});
	};
}

export const TOGGLE_ADMIN_MODE = "TOGGLE_ADMIN_MODE";

export function toggleAdminMode(adminModeOn) {
	return (dispatch) => {
		return V2.LoginService.setAdminModeApiV2UsersMeAdminModePost(adminModeOn)
			.then((json) => {
				dispatch({
					type: TOGGLE_ADMIN_MODE,
					adminMode: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(toggleAdminMode(adminModeOn));
			});
	};
}

export const GET_ADMIN_MODE_STATUS = "GET_ADMIN_MODE_STATUS";

export function getAdminModeStatus() {
	return (dispatch) => {
		return V2.LoginService.getAdminModeApiV2UsersMeAdminModeGet()
			.then((json) => {
				dispatch({
					type: GET_ADMIN_MODE_STATUS,
					adminMode: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(getAdminModeStatus());
			});
	};
}

export const PREFIX_SEARCH_USERS = "PREFIX_SEARCH_USERS";

export function prefixSearchAllUsers(text = "", skip = 0, limit = 101) {
	return (dispatch) => {
		return V2.UsersService.searchUsersPrefixApiV2UsersPrefixSearchGet(
			text,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: PREFIX_SEARCH_USERS,
					users: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(prefixSearchAllUsers(text, skip, limit));
			});
	};
}

export const LIST_API_KEYS = "LIST_API_KEYS";

export function listApiKeys(skip = 0, limit = 10) {
	return (dispatch) => {
		return V2.UsersService.getUserApiKeysApiV2UsersKeysGet(skip, limit)
			.then((json) => {
				dispatch({
					type: LIST_API_KEYS,
					apiKeys: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, listApiKeys(skip, limit)));
			});
	};
}

export const GENERATE_API_KEY = "GENERATE_API_KEY";

export function generateApiKey(name = "", minutes = 30) {
	return (dispatch) => {
		return V2.UsersService.generateUserApiKeyApiV2UsersKeysPost(name, minutes)
			.then((json) => {
				dispatch({
					type: GENERATE_API_KEY,
					hashedKey: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, generateApiKey(name, minutes)));
			});
	};
}

export const DELETE_API_KEY = "DELETE_API_KEY";

export function deleteApiKey(keyId) {
	return (dispatch) => {
		return V2.UsersService.deleteUserApiKeyApiV2UsersKeysKeyIdDelete(keyId)
			.then((json) => {
				dispatch({
					type: DELETE_API_KEY,
					apiKey: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, deleteApiKey(keyId)));
			});
	};
}

export const RESET_API_KEY = "RESET_API_KEY";

export function resetApiKey() {
	return (dispatch) => {
		dispatch({
			type: RESET_API_KEY,
			receivedAt: Date.now(),
		});
	};
}

export const RECEIVE_USER_PROFILE = "RECEIVE_USER_PROFILE";

export function fetchUserProfile() {
	return (dispatch) => {
		return V2.UsersService.getProfileApiV2UsersProfileGet()
			.then((json) => {
				dispatch({
					type: RECEIVE_USER_PROFILE,
					profile: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchUserProfile()));
			});
	};
}

export const SET_ADMIN = "SET_ADMIN";

export function setAdmin(email) {
	return (dispatch) => {
		return V2.LoginService.setAdminApiV2UsersSetAdminUseremailPost(email)
			.then((json) => {
				dispatch({
					type: SET_ADMIN,
					profile: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, setAdmin(email)));
			});
	};
}

export const REVOKE_ADMIN = "REVOKE_ADMIN";

export function revokeAdmin(email) {
	return (dispatch) => {
		return V2.LoginService.revokeAdminApiV2UsersRevokeAdminUseremailPost(email)
			.then((json) => {
				dispatch({
					type: REVOKE_ADMIN,
					profile: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, revokeAdmin(email)));
			});
	};
}

export const ENABLE_READONLY = "ENABLE_READONLY";

export function enableReadOnly(email) {
	return (dispatch) => {
		return V2.LoginService.enableReadonlyUserApiV2UsersEnableReadonlyUseremailPost(
			email
		)
			.then((json) => {
				dispatch({
					type: ENABLE_READONLY,
					profile: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, enableReadOnly(email)));
			});
	};
}

export const DISABLE_READONLY = "DISABLE_READONLY";

export function disableReadOnly(email) {
	return (dispatch) => {
		return V2.LoginService.disableReadonlyUserApiV2UsersDisableReadonlyUseremailPost(
			email
		)
			.then((json) => {
				dispatch({
					type: DISABLE_READONLY,
					profile: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, disableReadOnly(email)));
			});
	};
}
