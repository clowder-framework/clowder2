import {V2} from "../openapi";

export const userActions = {
	login,
	logout
};

export async function loginHelper(username, password, register = false) {
	const data = {"name": username, "password": password};
	if (register) {
		return V2.UsersService.saveUserApiV2UsersPost(data).catch(reason => {
			console.error("Failed to register a user! ", reason);
			// logout();
			return {};
		})
			.then(user => {return user;});
	} else {
		return V2.LoginService.loginApiV2LoginPost(data).catch(reason => {
			console.error("Failed to login a user! ", reason);
			// logout();
			return {};
		})
			.then(user => {return user;});
	}
}

export const LOGIN_ERROR = "LOGIN_ERROR";
export const SET_USER = "SET_USER";
export const REGISTER_USER = "REGISTER_USER";
export const REGISTER_ERROR = "REGISTER_ERROR";
export const LOGOUT = "LOGOUT";

export function login(username, password) {
	return async (dispatch) => {
		const json = await loginHelper(username, password, false);
		V2.OpenAPI.TOKEN = undefined;
		localStorage.removeItem("Authorization");

		if (json["token"] !== undefined && json["token"] !== "none") {
			localStorage.setItem("Authorization", `bearer ${json["token"]}`);
			V2.OpenAPI.TOKEN = json["token"];
			return dispatch({
				type: SET_USER,
				Authorization: `bearer ${json["token"]}`,
			});
		} else {
			return dispatch({
				type: LOGIN_ERROR,
				Authorization: "",
			});
		}
	};
}

export function register(username, password) {
	return async (dispatch) => {
		const json = await loginHelper(username, password, true);
		if (json !== undefined) {
			return dispatch({
				type: REGISTER_USER,
			});
		} else {
			return dispatch({
				type: REGISTER_ERROR,
			});
		}
	};
}

export function logout() {
	return (dispatch) => {
		V2.OpenAPI.TOKEN = undefined;
		localStorage.removeItem("Authorization");
		return dispatch({
			type: LOGOUT
		});
	};
}
