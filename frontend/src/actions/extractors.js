import {V2} from "../openapi";
import {handleErrors} from "./common";
import config from "../app.config";
import {getHeader} from "../utils/common";

export const RECEIVE_EXTRACTORS = "RECEIVE_EXTRACTORS";

export function fetchExtractors(){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ExtractorsService.getExtractorsApiV2ExtractorsGet()
			.then(json => {
				dispatch({
					type: RECEIVE_EXTRACTORS,
					extractors: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchExtractors()));
			});

	};
}
