import {LOGOUT, logoutHelper} from "./user";
import config from "../app.config";
import {V2} from "../openapi";
import Cookies from "universal-cookie";
const cookies = new Cookies();


export const RESET_FAILED = "RESET_FAILED";
export function resetFailedReason(){
	return (dispatch) => {
		dispatch({
			type:RESET_FAILED,
			reason:"",
			receivedAt: Date.now(),
		});
	};
}

export const RESET_LOGOUT = "RESET_LOGOUT";
export function resetLogout(){
	return (dispatch) => {
		dispatch({
			type:RESET_LOGOUT,
			receivedAt: Date.now(),
		});
	};
}

export const FAILED = "FAILED";
export function handleErrors(reason, callback){
	// Authorization error we need to automatically logout user
	if (reason.status === 401){
		return async (dispatch) => {
			const headers = {"Authorization": cookies.get("Authorization")};
			let response = await fetch(config.KeycloakRefresh, {method: "GET", headers: headers});
			if (response.status === 200) {
				const json = await response.json();
				if (json["access_token"] !== undefined && json["access_token"] !== "none") {
					cookies.set("Authorization", `Bearer ${json["access_token"]}`);
					V2.OpenAPI.TOKEN = json["access_token"];
					dispatch(callback);
				}
			}
			else {
				logoutHelper();
				return (dispatch) => {
					dispatch({
						type: LOGOUT,
						receivedAt: Date.now()
					});
				};
			}
		};
	}
	else{
		return (dispatch) => {
			dispatch({
				type: FAILED,
				reason: reason.message !== undefined? reason.message : "Backend Failure. Couldn't fetch!",
				stack: reason.stack ? reason.stack : "",
				receivedAt: Date.now()
			});
		};
	}
}
