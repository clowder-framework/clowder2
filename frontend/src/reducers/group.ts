import {
	RECEIVE_GROUPS,
	RECEIVE_GROUP_ABOUT
} from "../actions/group";
import {DataAction} from "../types/action";
import {GroupState} from "../types/data";
import {GroupOut} from "../openapi/v2";

const defaultState: GroupState = {
	groups: [],
	about: <GroupOut>{}
};

const group = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_GROUPS:
			return Object.assign({}, state, {groups: action.groups});
		case RECEIVE_GROUP_ABOUT:
			return Object.assign({}, state, {about: action.about});
        default:
            return state;
	}
};

export default group;
