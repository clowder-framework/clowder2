import {getHeader} from "./common";
import config from "../app.config";


export async function fetchFileMetadata(id){
	let url = `${config.hostname}/clowder/api/files/${id}/metadata?superAdmin=true`;
	let response = await fetch(url, {mode:"cors", headers: getHeader()});
	if (response.status  === 200){
		return await response.json();
	}
	else if  (response.status  === 401){
		// TODO handle error
		return {};
	}
	else {
		// TODO handle error
		return {};
	}
}
