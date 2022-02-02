import {V2} from "../openapi";

export const userActions = {
	login,
	logout
};

export async function loginHelper(username, password, register = false) {
	const data = {"name": username, "password": password};
	if (register) {
		return V2.UsersService.saveUserApiV2UsersPost(data)
			.then(user => {return user;})
			.catch(reason => {
			// logout();
				return {"errorMsg": `Failed to register a user! ${reason}`};
			});
	} else {
		return V2.LoginService.loginApiV2LoginPost(data)
			.then(user => {return user;})
			.catch(reason => {
			// logout();
				return {"errorMsg": `Failed to login a user! ${reason}`};
			});
	}
}

export async function logoutHelper(){
	V2.OpenAPI.TOKEN = undefined;
	localStorage.removeItem("Authorization");
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
				errorMsg: json["errorMsg"] !== undefined && json["errorMsg"] !== "" ? json["errorMsg"]: "Username/Password incorrect!"
			});
		}
	};
}

export function register(username, password) {
	return async (dispatch) => {
		const json = await loginHelper(username, password, true);
		if (json["name"] !== undefined && json["hashed_password"] !== undefined) {
			return dispatch({
				type: REGISTER_USER,
			});
		} else {
			return dispatch({
				type: REGISTER_ERROR,
				errorMsg: json["errorMsg"] !== undefined && json["errorMsg"] !== "" ? json["errorMsg"]: "Fail to register!"
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
