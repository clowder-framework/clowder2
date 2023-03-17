import {
	RECEIVE_GROUP_ABOUT
} from "../actions/group";
import {DataAction} from "../types/action";
import {GroupState} from "../types/data";
import {GroupOut} from "../openapi/v2";

const defaultState: GroupState = {
	about: <GroupOut>{}
};

const groups = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_GROUP_ABOUT:
			return Object.assign({}, state, {about: action.about});
        default:
            return state;
	}
};

export default groups;
