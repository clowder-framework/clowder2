import {V2} from "../openapi";
import {handleErrors} from "./common";

export const RECEIVE_LISTENERS = "RECEIVE_LISTENERS";

export function fetchListeners(skip=0, limit=21, category=null){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.getListenersApiV2ListenersGet(skip, limit, category)
			.then(json => {
				dispatch({
					type: RECEIVE_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListeners(skip, limit, category)));
			});

	};
}

export const SEARCH_LISTENERS = "SEARCH_LISTENERS";

export function queryListeners(text, skip=0, limit=21){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.searchListenersApiV2ListenersSearchGet(text, skip, limit)
			.then(json => {
				dispatch({
					type: SEARCH_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, queryListeners(text, skip, limit)));
			});

	};
}
