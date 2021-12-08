import Cookies from "universal-cookie";

const cookies = new Cookies();


//NOTE: This is only checking if a cookie is present, but not validating the cookie.
export const isAuthorized = () => {
	const authorization = localStorage.getItem("Authorization");
	return process.env.DEPLOY_ENV === "local" ||
			(authorization !== undefined && authorization !== "" && authorization !==
					null && authorization !== "bearer none");
};

// construct header
export function getHeader() {
	// return authorization header with jwt token
	const authorization = localStorage.getItem("Authorization");

	if (authorization) {
		return new Headers({ "Authorization": authorization});
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
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

export function dataURItoFile(dataURI) {
	const metadata = dataURI.split(",")[0];
	const mime = metadata.match(/:(.*?);/)[1];
	const filename = metadata.match(/name=(.*?);/)[1];

	const binary = atob(dataURI.split(",")[1]);
	const array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(array)], {type: mime});
	return new File([blob], filename, {type: mime, lastModified: new Date()});
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

// get current user's encoded email address for datawolf use
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
// // get current user's encoded email address for datawolf use
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
