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
export function handleErrors(reason, originalFunc){
	// Authorization error we need to automatically logout user
	if (reason.status === 401){

		const headers = {"Authorization": cookies.get("Authorization")};

		return (dispatch) => {
			return fetch(config.KeycloakRefresh, {method: "GET", headers: headers})
				.then((response) => {
					if (response.status === 200) return response.json();
				})
				.then(json =>{
					// refresh
					if (json["access_token"] !== undefined && json["access_token"] !== "none") {
						cookies.set("Authorization", `Bearer ${json["access_token"]}`);
						V2.OpenAPI.TOKEN = json["access_token"];
						dispatch(originalFunc);
					}
				})
				.catch(() => {
					// logout
					dispatch({
						type: LOGOUT,
						receivedAt: Date.now()
					});
					// Delete bad JWT token
					V2.OpenAPI.TOKEN = undefined;
					cookies.remove("Authorization", { path: "/" });
				});
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
