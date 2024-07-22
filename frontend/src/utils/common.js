import Cookies from "universal-cookie";
import { V2 } from "../openapi";
import jwt_decode from "jwt-decode";
import { formatInTimeZone } from "date-fns-tz";
import config from "../app.config";
import { csv } from "csvtojson";

const cookies = new Cookies();

//NOTE: This is only checking if a cookie is present, but not validating the cookie.
export const isAuthorized = () => {
	const authorization = cookies.get("Authorization") || "Bearer none";
	V2.OpenAPI.TOKEN = authorization.replace("Bearer ", "");
	return (
		process.env.DEPLOY_ENV === "local" ||
		(authorization !== "" &&
			authorization !== null &&
			authorization !== "Bearer none")
	);
};

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

export async function downloadPublicResource(url) {
	const authHeader = getHeader();
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
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

// For format options see https://date-fns.org/v2.30.0/docs/format
export function parseDate(dateString, formatString = "yyyy-MM-dd HH:mm:ss") {
	if (dateString) {
		try {
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			// need to add Zulu (Z) to the end if it's not present
			if (!dateString.endsWith("Z")) dateString = `${dateString}Z`;
			const date = new Date(dateString);

			return formatInTimeZone(date, timeZone, formatString);
		} catch (error) {
			console.error(error);
			return error["message"];
		}
	} else {
		return "Pending...";
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
		authorization !== "" &&
		authorization.split(" ").length > 0
	) {
		if (authorization === "Bearer none") {
			return "public@clowder.org";
		}
		const userInfo = jwt_decode(authorization.split(" ")[1]);
		return userInfo["email"];
	}
};

// Function to read the text from the downloaded file
export function readTextFromFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const text = reader.result;
			resolve(text);
		};

		reader.onerror = () => {
			reader.abort();
			reject(new Error("Failed to read the file"));
		};

		reader.readAsText(file);
	});
}

export function parseTextToJson(text) {
	return csv()
		.fromString(text)
		.then((jsonObj) => {
			return jsonObj;
		});
}

export function guessDataType(inputString) {
	// TODO write better patterns
	// Define regular expressions for common patterns
	const quantitativePattern = /^[-+]?\d+(\.\d+)?$/;
	const temporalPattern =
		/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
	const ordinalPattern = /[a-zA-Z]/;
	const nominalPattern = /[a-zA-Z]/;
	const geojsonPattern =
		/^(\{"type": "Feature".*?\}|{"type": "FeatureCollection".*?})$/;

	// Test the input string against each pattern
	if (quantitativePattern.test(inputString)) {
		return "quantitative";
	} else if (temporalPattern.test(inputString)) {
		return "temporal";
	} else if (ordinalPattern.test(inputString)) {
		return "ordinal";
	} else if (nominalPattern.test(inputString)) {
		return "nominal";
	} else if (geojsonPattern.test(inputString)) {
		return "geojson";
	} else {
		// If none of the patterns match, it's hard to determine the data type
		return "unknown";
	}
}

export function renameId(obj) {
	Object.defineProperty(obj, "id", Object.getOwnPropertyDescriptor(obj, "_id"));
	delete obj["_id"];

	return obj;
}

export function renameIdArray(arr) {
	return arr.map((obj) => renameId(obj));
}

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

export const handleErrorReport = (reason, stack) => {
	window.open(
		`${config.GHIssueBaseURL}+${encodeURIComponent(
			reason
		)}&body=${encodeURIComponent(stack)}`
	);
};

export const authCheck = (adminMode, currRole, allowedRoles = []) => {
	return adminMode || (currRole && allowedRoles.includes(currRole));
};

export const frozenCheck = (frozen, frozen_version_num) => {
	return frozen && frozen_version_num && frozen_version_num > 0;
};

export const selectedHighlightStyles = (currentId, selectedId, theme) => {
	return {
		color: theme.palette.primary.main,
		pointerEvents: currentId === selectedId ? "none" : "auto",
		textDecoration: "none",
		fontWeight: currentId === selectedId ? "bold" : "normal",
		"&:hover": {
			textDecoration: "underline",
		},
	};
};

export const highlightLatestStyles = (
	frozen,
	frozenVersionNum,
	currentId,
	originId,
	theme
) => {
	return {
		color: theme.palette.primary.main,
		pointerEvents:
			(frozen === false && frozenVersionNum === -999) || currentId === originId
				? "none"
				: "auto",
		textDecoration: "none",
		fontWeight:
			(frozen === false && frozenVersionNum === -999) || currentId === originId
				? "bold"
				: "normal",
		"&:hover": {
			textDecoration: "underline",
		},
	};
};
