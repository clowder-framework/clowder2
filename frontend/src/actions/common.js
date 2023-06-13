import { LOGOUT, SET_USER } from "./user";
import config from "../app.config";
import { V2 } from "../openapi";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export const RESET_FAILED = "RESET_FAILED";

export function resetFailedReason() {
	return (dispatch) => {
		dispatch({
			type: RESET_FAILED,
			reason: "",
			stack: "",
			receivedAt: Date.now(),
		});
	};
}

export const RESET_LOGOUT = "RESET_LOGOUT";

export function resetLogout() {
	return (dispatch) => {
		dispatch({
			type: RESET_LOGOUT,
			receivedAt: Date.now(),
		});
	};
}

export const refreshToken = async (dispatch, originalFunc) => {
	try {
		const headers = { Authorization: cookies.get("Authorization") };
		const response = await fetch(config.KeycloakRefresh, {
			method: "GET",
			headers: headers,
		});
		const json = await response.json();
		if (json["access_token"] !== undefined && json["access_token"] !== "none") {
			cookies.set("Authorization", `Bearer ${json["access_token"]}`);
			V2.OpenAPI.TOKEN = json["access_token"];
			if (originalFunc) dispatch(originalFunc);
			else
				dispatch({
					type: SET_USER,
					Authorization: `Bearer ${json["access_token"]}`,
				});
		}
	} catch (error) {
		// logout
		dispatch({
			type: LOGOUT,
			receivedAt: Date.now(),
		});
		// Delete bad JWT token
		V2.OpenAPI.TOKEN = undefined;
		cookies.remove("Authorization", { path: "/" });
	}
};

export const FAILED = "FAILED";
export const NOT_FOUND = "NOT_FOUND";
export const NOT_AUTHORIZED = "NOT_AUTHORIZED";

export function handleErrors(reason, originalFunc) {
	// Authorization error we need to automatically logout user
	if (reason.status === 401) {
		return (dispatch) => {
			refreshToken(dispatch, originalFunc);
		};
	} else if (reason.status === 403) {
		return (dispatch) => {
			dispatch({
				type: NOT_AUTHORIZED,
				reason:
					reason.body !== undefined && reason.body.detail !== undefined
						? reason.body.detail
						: "Forbidden",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now(),
			});
		};
	} else if (reason.status === 404) {
		return (dispatch) => {
			dispatch({
				type: NOT_FOUND,
				reason:
					reason.body !== undefined && reason.body.detail !== undefined
						? reason.body.detail
						: "Not Found",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now(),
			});
		};
	} else {
		return (dispatch) => {
			dispatch({
				type: FAILED,
				reason:
					reason.body.detail !== undefined
						? reason.body.detail
						: "Backend Failure. Couldn't fetch!",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now(),
			});
		};
	}
}

// Special function to use for authorization endpoint
// 404 in auth actually means 403
export function handleErrorsAuthorization(reason, originalFunc) {
	// Authorization error we need to automatically logout user
	if (reason.status === 401) {
		const headers = { Authorization: cookies.get("Authorization") };

		return (dispatch) => {
			return fetch(config.KeycloakRefresh, { method: "GET", headers: headers })
				.then((response) => {
					if (response.status === 200) return response.json();
				})
				.then((json) => {
					// refresh
					if (
						json["access_token"] !== undefined &&
						json["access_token"] !== "none"
					) {
						cookies.set("Authorization", `Bearer ${json["access_token"]}`);
						V2.OpenAPI.TOKEN = json["access_token"];
						dispatch(originalFunc);
					}
				})
				.catch(() => {
					// logout
					dispatch({
						type: LOGOUT,
						receivedAt: Date.now(),
					});
					// Delete bad JWT token
					V2.OpenAPI.TOKEN = undefined;
					cookies.remove("Authorization", { path: "/" });
				});
		};
	} else if (reason.status === 403 || reason.status === 404) {
		return (dispatch) => {
			dispatch({
				type: NOT_AUTHORIZED,
				reason: "Forbidden",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now(),
			});
		};
	} else {
		return (dispatch) => {
			dispatch({
				type: FAILED,
				reason:
					reason.message !== undefined
						? reason.message
						: "Backend Failure. Couldn't fetch!",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now(),
			});
		};
	}
}
