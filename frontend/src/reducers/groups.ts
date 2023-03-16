import {
	RECEIVE_GROUPS
} from "../actions/group";
import {DataAction} from "../types/action";
import {GroupState} from "../types/data";

const defaultState: GroupState = {
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
