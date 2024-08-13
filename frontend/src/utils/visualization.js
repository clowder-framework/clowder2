import { getHeader } from "./common";
import config from "../app.config";

export function generateThumbnailUrl(thumbnailId) {
	return `${config.hostname}/api/v2/thumbnails/${thumbnailId}`;
}

export function generatePublicThumbnailUrl(thumbnailId) {
	return `${config.hostname}/api/v2/public_thumbnails/${thumbnailId}`;
}

export function generateVisDataDownloadUrl(visualizationId) {
	return `${config.hostname}/api/v2/visualizations/${visualizationId}/bytes`;
}

export function generatePublicVisDataDownloadUrl(visualizationId) {
	return `${config.hostname}/api/v2/public_visualizations/${visualizationId}/bytes`;
}

export function generateFileDownloadUrl(fileId, fileVersionNum = 0) {
	let url = `${config.hostname}/api/v2/files/${fileId}?increment=false`;
	if (fileVersionNum > 0) url = `${url}&version=${fileVersionNum}`;

	return url;
}

export function generatePublicFileDownloadUrl(fileId, fileVersionNum = 0) {
	let url = `${config.hostname}/api/v2/public_files/${fileId}?increment=false`;
	if (fileVersionNum > 0) url = `${url}&version=${fileVersionNum}`;

	return url;
}

export async function downloadVisData(visualizationId) {
	const endpoint = `${config.hostname}/api/v2/visualizations/${visualizationId}/bytes`;
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
	if (fileVersionNum !== 0) endpoint = `${endpoint}?version=${fileVersionNum}`;
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

export async function publicFileDownloaded(fileId) {
	const endpoint = `${config.hostname}/api/v2/public_files/${fileId}?increment=False`;
	const response = await fetch(endpoint, {
		method: "GET",
		mode: "cors",
	});

	if (response.status === 200) {
		return await response.blob();
	} else {
		return "";
	}
}
