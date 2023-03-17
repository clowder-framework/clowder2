import {
	RECEIVE_GROUPS
} from "../actions/group";
import {DataAction} from "../types/action";
import {GroupsState} from "../types/data";

const defaultState: GroupsState = {
	groups: [],
};

const groups = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_GROUPS:
			return Object.assign({}, state, {groups: action.groups});
        default:
            return state;
	}
};

export default groups;
