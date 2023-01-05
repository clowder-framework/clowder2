import {RECEIVE_LISTENERS, SEARCH_LISTENERS, RECEIVE_LISTENER_CATEGORIES} from "../actions/listeners";
import {DataAction} from "../types/action";
import {ListenerState} from "../types/data";

const defaultState: ListenerState = {
	listeners: [],
	categories: []
};

const listeners = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_LISTENERS:
			return Object.assign({}, state, {listeners: action.listeners});
		case SEARCH_LISTENERS:
			return Object.assign({}, state, {listeners: action.listeners});
		case RECEIVE_LISTENER_CATEGORIES:
			return Object.assign({}, state, {categories: action.categories});
		default:
			return state;
	}
};

export default listeners;
