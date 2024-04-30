import {
	FETCH_JOB_SUMMARY,
	FETCH_JOB_UPDATES,
	RECEIVE_LISTENER_CATEGORIES,
	RECEIVE_LISTENER_JOBS,
	RECEIVE_LISTENER_LABELS,
	RECEIVE_LISTENERS,
	TOGGLE_ACTIVE_FLAG_LISTENER,
	RESET_JOB_SUMMARY,
	RESET_JOB_UPDATES,
	SEARCH_LISTENERS,
} from "../actions/listeners";
import { SUBMIT_DATASET_EXTRACTION } from "../actions/dataset";
import { SUBMIT_FILE_EXTRACTION } from "../actions/file";
import { DataAction } from "../types/action";
import { ListenerState } from "../types/data";
import { EventListenerJobOut, Paged, PageMetadata } from "../openapi/v2";

const defaultState: ListenerState = {
	listeners: <Paged>{ metadata: <PageMetadata>{}, data: <EventListener[]>[] },
	categories: [],
	labels: [],
	jobs: <Paged>{ metadata: <PageMetadata>{}, data: <EventListenerJobOut[]>[] },
	currJobSummary: [],
	currJobUpdates: [],
	currJobId: "",
};

const listeners = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_LISTENERS:
			return Object.assign({}, state, { listeners: action.listeners });
		case TOGGLE_ACTIVE_FLAG_LISTENER:
			// @ts-ignore
			// eslint-disable-next-line no-case-declarations
			const updatedListeners = state.listeners.data.map((listener) => {
				// Check if the current listener matches the one being toggled
				if (listener.id === action.listener.id) {
					// Toggle the active flag of the matched item
					action.listener.alive = listener.alive;
					return action.listener;
				} else return listener;
			});
			return Object.assign({}, state, {
				listeners: {
					metadata: state.listeners.metadata,
					data: updatedListeners,
				},
			});

		//return { ...state, listeners: updatedListeners };
		case SEARCH_LISTENERS:
			return Object.assign({}, state, { listeners: action.listeners });
		case RECEIVE_LISTENER_CATEGORIES:
			return Object.assign({}, state, { categories: action.categories });
		case RECEIVE_LISTENER_LABELS:
			return Object.assign({}, state, { labels: action.labels });
		case RECEIVE_LISTENER_JOBS:
			return Object.assign({}, state, { jobs: action.jobs });
		case FETCH_JOB_SUMMARY:
			return Object.assign({}, state, {
				currJobSummary: action.currJobSummary,
			});
		case RESET_JOB_SUMMARY:
			return Object.assign({}, state, {
				currJobSummary: {},
			});
		case FETCH_JOB_UPDATES:
			return Object.assign({}, state, {
				currJobUpdates: action.currJobUpdates,
			});
		case RESET_JOB_UPDATES:
			return Object.assign({}, state, {
				currJobUpdates: action.currJobUpdates,
			});
		case SUBMIT_DATASET_EXTRACTION:
			return Object.assign({}, state, { currJobId: action.job_id });
		case SUBMIT_FILE_EXTRACTION:
			return Object.assign({}, state, { currJobId: action.job_id });
		default:
			return state;
	}
};

export default listeners;
