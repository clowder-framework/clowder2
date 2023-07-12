import { getHeader } from "./common";
import config from "../app.config";

export async function downloadThumbnail(thumbnailId, title = null) {
	const url = `${config.hostname}/thumbnails/${thumbnailId}/blob?superAdmin=true`;
	const authHeader = getHeader();
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: authHeader,
	});

	if (response.status === 200) {
		const blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, thumbnailId);
			return null;
		} else {
			return window.URL.createObjectURL(blob);
		}
	} else if (response.status === 401) {
		// TODO handle error
		// logout();
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

export async function generateVisDataDownloadUrl(visualizationId) {
	let endpoint = `${config.hostname}/api/v2/visualizations/download/${visualizationId}`;
	const response = await fetch(endpoint, {
		method: "GET",
		mode: "cors",
		headers: await getHeader(),
	});

	if (response.status === 200) {
		const blob = await response.blob();
		return window.URL.createObjectURL(blob);
	} else {
		return "";
	}
}

export async function generateFileDownloadUrl(fileId, fileVersionNum = 0) {
	let url = `${config.hostname}/api/v2/files/${fileId}`;
	if (fileVersionNum > 0) url = url + "?version=" + fileVersionNum;

	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: await getHeader(),
	});

	if (response.status === 200) {
		const blob = await response.blob();
		return window.URL.createObjectURL(blob);
	} else {
		return "";
	}
}

export async function downloadVisData(visualizationId) {
	let endpoint = `${config.hostname}/api/v2/visualizations/download/${visualizationId}`;
	const response = await fetch(endpoint, {
		method: "GET",
		mode: "cors",
		headers: await getHeader(),
	});

	if (response.status === 200) {
		return await response.blob();
	} else {
		return "";
	}
}

export async function fileDownloaded(fileId, fileVersionNum = 0) {
	let endpoint = `${config.hostname}/api/v2/files/${fileId}`;
	if (fileVersionNum !== 0) endpoint = endpoint + "?version=" + fileVersionNum;
	const response = await fetch(endpoint, {
		method: "GET",
		mode: "cors",
		headers: await getHeader(),
	});

	if (response.status === 200) {
		return await response.blob();
	} else {
		return "";
	}
}
