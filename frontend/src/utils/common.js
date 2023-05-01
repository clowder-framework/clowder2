import Cookies from "universal-cookie";
import { V2 } from "../openapi";
import { format } from "date-fns";
import jwt_decode from "jwt-decode";
import {handleErrors} from "../actions/common";
import {RECEIVE_DATASET_ABOUT} from "../actions/dataset";
import config from "../app.config";

const cookies = new Cookies();

//NOTE: This is only checking if a cookie is present, but not validating the cookie.
export async function isAuthorized(datasetId = "", fileId = "") {

	if (datasetId !== "") {
		const datasetURL = `${config.hostname}/api/v2/datasets/${datasetId}`;
		const response = await fetch(datasetURL, {
			method: "GET",
		});
		if (response.status === 200) {
			return true
		} else {
			const authorization = cookies.get("Authorization") || "Bearer none";
			V2.OpenAPI.TOKEN = authorization.replace("Bearer ", "");
			return (
				process.env.DEPLOY_ENV === "local" ||
				(authorization !== undefined &&
					authorization !== "" &&
					authorization !== null &&
					authorization !== "Bearer none")
			);
		}
	} else {
		const authorization = cookies.get("Authorization") || "Bearer none";
		V2.OpenAPI.TOKEN = authorization.replace("Bearer ", "");
		return (
			process.env.DEPLOY_ENV === "local" ||
			(authorization !== undefined &&
				authorization !== "" &&
				authorization !== null &&
				authorization !== "Bearer none")
		);
	}
}

// construct header
export function getHeader() {
	// return authorization header with jwt token
	const authorization = cookies.get("Authorization") || "Bearer none";
	V2.OpenAPI.TOKEN = authorization.replace("Bearer ", "");
	if (authorization) {
		return new Headers({ Authorization: authorization });
	} else {
		return {};
	}
}

export async function downloadResource(url) {
	const authHeader = getHeader();
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: authHeader,
	});

	if (response.status === 200) {
		const blob = await response.blob();
		return window.URL.createObjectURL(blob);
	} else if (response.status === 401) {
		// TODO handle error
		// logout();
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

export function dataURItoFile(dataURI) {
	const metadata = dataURI.split(",")[0];
	const mime = metadata.match(/:(.*?);/)[1];
	const filename = decodeURIComponent(metadata.match(/name=(.*?);/)[1]);

	const binary = atob(dataURI.split(",")[1]);
	const array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(array)], { type: mime });
	return new File([blob], filename, { type: mime, lastModified: new Date() });
}

export function parseDate(dateString) {
	if (dateString) {
		try {
			return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
		} catch (error) {
			console.error(error);
			return error["message"];
		}
	} else {
		return "Invalid time value!";
	}
}

// Capitalize first letter of a string and lower case the rest
export const capitalize = (s) =>
	s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Get Current Email from JWT
export const getCurrEmail = () => {
	const authorization = cookies.get("Authorization") || "Bearer none";
	if (
		authorization &&
		authorization !== "Bearer none" &&
		authorization !== "" &&
		authorization.split(" ").length > 0
	) {
		let userInfo = jwt_decode(authorization.split(" ")[1]);
		return userInfo["email"];
	} else {
		return "anonymoususer@anonymoususer.com"
	}
};

// get current username
// export function getCurrUsername(){
// 	if (process.env.DEPLOY_ENV === "local"){
// 		return config.testUserInfo;
// 	}
// 	else{
// 		let cookie = cookies.get("Authorization");
// 		if (cookie !== "" && cookie.split(" ").length > 0){
// 			let userInfo = jwt_decode(cookie.split(" ")[1]);
// 			return userInfo["preferred_username"];
// 		}
// 	}
// }

// get current user"s encoded email address for datawolf use
// export function getCurrUserInfo(){
// 	if (process.env.DEPLOY_ENV === "local"){
// 		return config.testUserInfo;
// 	}
// 	else{
// 		let cookie = cookies.get("Authorization");
// 		if (cookie !== "" && cookie.split(" ").length > 0){
// 			let userInfo = jwt_decode(cookie.split(" ")[1]);
// 			let email = userInfo["email"];
// 			return btoa(`{"email":"${email}"}`);
// 		}
// 	}
// }
//
// // get incore token and write to a file
// export function getIncoreTokenFile(){
// 	if (process.env.DEPLOY_ENV !== "local"){
// 		return new Blob([cookies.get("Authorization")], {type:"text/plain"});
// 	}
// 	else{
// 		return null;
// 	}
// }
//
// // get current user"s encoded email address for datawolf use
// export function getCurrUserEmail(){
// 	if (process.env.DEPLOY_ENV === "local"){
// 		return config.testUserInfo;
// 	}
// 	else{
// 		let cookie = cookies.get("Authorization");
// 		if (cookie !== "" && cookie.split(" ").length > 0){
// 			let userInfo = jwt_decode(cookie.split(" ")[1]);
// 			return userInfo["email"];
// 		}
// 	}
// }

// export function getShortHTML(html){
// 	let htmlSoup = new JSSoup(html);
// 	return htmlSoup.find("div", "shortDescription");
// }
//
// export function round(val, n){
// 	if (n === undefined || n === 0) {
// 		return Math.round(val);
// 	}
// 	else {
// 		return Number(val).toFixed(n);
// 	}
// }
//
// export function formatPercent(val, n = 1){
// 	return `${round(val, n)  }%`;
// }
//
// export function formatProbToPercent(val, n = 1){
// 	return formatPercent(val*100, n);
// }
