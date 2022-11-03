import {RECEIVE_LISTENERS} from "../actions/listeners";
import {DataAction} from "../types/action";
import {ListenerState} from "../types/data";

const defaultState: ListenerState = {
	listeners: []
};

const listeners = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_LISTENERS:
			return Object.assign({}, state, {listeners: action.listeners});
		default:
			return state;
	}
};

export default listeners;
