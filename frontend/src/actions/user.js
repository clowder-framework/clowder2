import { V2 } from "../openapi";
import Cookies from "universal-cookie";
import config from "../app.config";

const cookies = new Cookies();

export const userActions = {
	login,
	logout,
};

// TODO need to clean up this file with all the mixed login/logout methods

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

export function login(email, password) {
	return async (dispatch) => {
		const json = await loginHelper(email, password, false);
		V2.OpenAPI.TOKEN = undefined;
		cookies.remove("Authorization", { path: "/" });

		if (json["token"] !== undefined && json["token"] !== "none") {
			cookies.set("Authorization", `Bearer ${json["token"]}`);
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

export function register(email, password, firstname, lastname) {
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

export const LIST_API_KEYS = "LIST_API_KEYS";

export function listApiKeys(skip = 0, limit = 10) {
	return (dispatch) => {
		return V2.UsersService.generateUserApiKeyApiV2UsersKeysGet(skip, limit)
			.then((json) => {
				dispatch({
					type: LIST_API_KEYS,
					apiKeys: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(listApiKeys(skip, limit));
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
					apiKey: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(generateApiKey(name, minutes));
			});
	};
}

export const DELETE_API_KEY = "DELETE_API_KEY";

export function deleteApiKey(keyId) {
	return (dispatch) => {
		return V2.UsersService.generateUserApiKeyApiV2UsersKeysKeyIdDelete(keyId)
			.then((json) => {
				dispatch({
					type: DELETE_API_KEY,
					apiKey: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(deleteApiKey(keyId));
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
