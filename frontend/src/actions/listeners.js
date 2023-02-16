import {V2} from "../openapi";
import {handleErrors} from "./common";

export const RECEIVE_LISTENERS = "RECEIVE_LISTENERS";

export function fetchListeners(skip=0, limit=21, category=null, label=null){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.getListenersApiV2ListenersGet(skip, limit, category, label)
			.then(json => {
				dispatch({
					type: RECEIVE_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListeners(skip, limit, category, label)));
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

export const RECEIVE_LISTENER_CATEGORIES = "RECEIVE_LISTENER_CATEGORIES";
export function fetchListenerCategories(){
	return (dispatch) => {
		return V2.ListenersService.listCategoriesApiV2ListenersCategoriesGet()
		.then(json => {
				dispatch({
					type: RECEIVE_LISTENER_CATEGORIES,
					categories: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListenerCategories()));
			});
	}
}

export const RECEIVE_LISTENER_LABELS = "RECEIVE_LISTENER_LABELS";
export function fetchListenerLabels(){
	return (dispatch) => {
		return V2.ListenersService.listDefaultLabelsApiV2ListenersDefaultLabelsGet()
		.then(json => {
				dispatch({
					type: RECEIVE_LISTENER_LABELS,
					labels: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	}
}


export const RECEIVE_LISTENER_JOBS = "RECEIVE_LISTENER_JOBS";
export function fetchListenerJobs(listenerId, status, userId=null, fileId=null, datasetId = null,
	created, skip=0, limit=100){
	return (dispatch) => {
		return V2.JobsService.getAllJobSummaryApiV2JobsGet(listenerId, status, userId, fileId, datasetId, created,
			skip, limit)
		.then(json => {
				dispatch({
					type: RECEIVE_LISTENER_JOBS,
					jobs: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListenerLabels(listenerId, status, userId=null, fileId=null,
					datasetId = null, created, skip=0, limit=100)));
			});
	}
}


export const FETCH_JOB_SUMMARY = "FETCH_JOB_SUMMARY";
export function fetchJobSummary(jobId){
	return (dispatch) => {
		return V2.JobsService.getJobSummaryApiV2JobsJobIdSummaryGet(jobId)
		.then(json => {
                console.log("INSIDE fetchJobSummary")
                console.log(json)
				dispatch({
					type: FETCH_JOB_SUMMARY,
					jobs: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	}
}


export const FETCH_JOB_UPDATES = "FETCH_JOB_UPDATES";
export function fetchJobUpdates(jobId){
	return (dispatch) => {
		return V2.JobsService.getJobUpdatesApiV2JobsJobIdUpdatesGet(jobId)
		.then(json => {
                console.log("INSIDE fetchJobUpdates")
                console.log(json)
				dispatch({
					type: FETCH_JOB_UPDATES,
					jobs: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	}
}
