import { V2 } from "../openapi";
import { handleErrors } from "./common";

export const RECEIVE_LISTENERS = "RECEIVE_LISTENERS";

export function fetchListeners(
	skip = 0,
	limit = 21,
	heartbeatInterval = 0,
	category = null,
	label = null,
	aliveOnly = false,
	process = null,
	dataset_id = null
) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.getListenersApiV2ListenersGet(
			skip,
			limit,
			heartbeatInterval,
			category,
			label,
			aliveOnly,
			process,
			dataset_id
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchListeners(
							skip,
							limit,
							heartbeatInterval,
							category,
							label,
							aliveOnly,
							process,
							dataset_id
						)
					)
				);
			});
	};
}

export const SEARCH_LISTENERS = "SEARCH_LISTENERS";

export function queryListeners(
	text,
	skip = 0,
	limit = 21,
	heartbeatInterval = 0,
	process = null,
	datasetId = null
) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.ListenersService.searchListenersApiV2ListenersSearchGet(
			text,
			skip,
			limit,
			heartbeatInterval,
			process,
			datasetId
		)
			.then((json) => {
				dispatch({
					type: SEARCH_LISTENERS,
					listeners: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						queryListeners(
							text,
							skip,
							limit,
							heartbeatInterval,
							process,
							datasetId
						)
					)
				);
			});
	};
}

export const RECEIVE_LISTENER_CATEGORIES = "RECEIVE_LISTENER_CATEGORIES";

export function fetchListenerCategories() {
	return (dispatch) => {
		return V2.ListenersService.listCategoriesApiV2ListenersCategoriesGet()
			.then((json) => {
				dispatch({
					type: RECEIVE_LISTENER_CATEGORIES,
					categories: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchListenerCategories()));
			});
	};
}

export const RECEIVE_LISTENER_LABELS = "RECEIVE_LISTENER_LABELS";

export function fetchListenerLabels() {
	return (dispatch) => {
		return V2.ListenersService.listDefaultLabelsApiV2ListenersDefaultLabelsGet()
			.then((json) => {
				dispatch({
					type: RECEIVE_LISTENER_LABELS,
					labels: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	};
}

export const RECEIVE_LISTENER_JOBS = "RECEIVE_LISTENER_JOBS";

export function fetchListenerJobs(
	listenerId,
	status,
	userId = null,
	fileId = null,
	datasetId = null,
	created,
	skip = 0,
	limit = 100
) {
	return (dispatch) => {
		return V2.JobsService.getAllJobSummaryApiV2JobsGet(
			listenerId,
			status,
			userId,
			fileId,
			datasetId,
			created,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_LISTENER_JOBS,
					jobs: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchListenerLabels(
							listenerId,
							status,
							(userId = null),
							(fileId = null),
							(datasetId = null),
							created,
							(skip = 0),
							(limit = 100)
						)
					)
				);
			});
	};
}

export const FETCH_JOB_SUMMARY = "FETCH_JOB_SUMMARY";

export function fetchJobSummary(jobId) {
	return (dispatch) => {
		return V2.JobsService.getJobSummaryApiV2JobsJobIdSummaryGet(jobId)
			.then((json) => {
				dispatch({
					type: FETCH_JOB_SUMMARY,
					currJobSummary: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	};
}

export const RESET_JOB_SUMMARY = "RESET_JOB_SUMMARY";

export function resetJobSummary() {
	return (dispatch) => {
		dispatch({
			type: RESET_JOB_SUMMARY,
			currJobSummary: {},
			receivedAt: Date.now(),
		});
	};
}

export const FETCH_JOB_UPDATES = "FETCH_JOB_UPDATES";

export function fetchJobUpdates(jobId) {
	return (dispatch) => {
		return V2.JobsService.getJobUpdatesApiV2JobsJobIdUpdatesGet(jobId)
			.then((json) => {
				dispatch({
					type: FETCH_JOB_UPDATES,
					currJobUpdates: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchListenerLabels()));
			});
	};
}

export const RESET_JOB_UPDATES = "RESET_JOB_UPDATES";

export function resetJobUpdates() {
	return (dispatch) => {
		dispatch({
			type: RESET_JOB_UPDATES,
			currJobUpdates: [],
			receivedAt: Date.now(),
		});
	};
}
