import {getHeader} from "./common";
import config from "../app.config";
import {logout} from "../actions/user";


export async function downloadThumbnail(thumbnailId, title=null) {
	const url = `${config.hostname}/thumbnails/${thumbnailId}/blob?superAdmin=true`;
	const authHeader = getHeader();
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: authHeader,
	});

	if (response.status  === 200){
		const blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, thumbnailId);
			return null;
		} else {
			return window.URL.createObjectURL(blob);
		}
	}
	else if  (response.status  === 401){
		// TODO handle error
		// logout();
		return null;
	}
	else {
		// TODO handle error
		return null;
	}
}
