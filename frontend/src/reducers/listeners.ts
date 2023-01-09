import {RECEIVE_LISTENERS, SEARCH_LISTENERS, RECEIVE_LISTENER_CATEGORIES,
	RECEIVE_LISTENER_LABELS} from "../actions/listeners";
import {DataAction} from "../types/action";
import {ListenerState} from "../types/data";

const defaultState: ListenerState = {
	listeners: [],
	categories: [],
	labels: []
};

const listeners = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_LISTENERS:
			return Object.assign({}, state, {listeners: action.listeners});
		case SEARCH_LISTENERS:
			return Object.assign({}, state, {listeners: action.listeners});
		case RECEIVE_LISTENER_CATEGORIES:
			return Object.assign({}, state, {categories: action.categories});
		case RECEIVE_LISTENER_LABELS:
			return Object.assign({}, state, {labels: action.labels});
		default:
			return state;
	}
};

export default listeners;
