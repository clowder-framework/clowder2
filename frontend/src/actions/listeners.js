import {V2} from "../openapi";
import {handleErrors} from "./common";
import config from "../app.config";
import {getHeader} from "../utils/common";

export const RECEIVE_LISTENERS = "RECEIVE_LISTENERS";

export function fetchListeners(skip=0, limit=21){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.getListenersApiV2ListenersGet(skip, limit)
			.then(json => {
				dispatch({
					type: RECEIVE_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListeners(skip, limit)));
			});

	};
}
