import config from "../app.config";
import {V2} from "../openapi";

export const userActions = {
	login,
	logout
};

export async function loginHelper(username, password, register=false) {
	let url = config.hostname;
	if (register) { url = `${url}/users`;}
	else { url = `${url}/login`;}

	const data = {"name": username, "password": password};
	const tokenRequest = await fetch(url, {
		method:"POST",
		mode:"cors",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	});

	const tokens = await tokenRequest.json();

	return tokens;
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
