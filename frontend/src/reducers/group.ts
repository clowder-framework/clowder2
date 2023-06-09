import {
	ADD_GROUP_MEMBER,
	ASSIGN_GROUP_MEMBER_ROLE,
	CREATE_GROUP,
	DELETE_GROUP,
	DELETE_GROUP_MEMBER,
	RECEIVE_GROUP_ABOUT,
	RECEIVE_GROUPS,
	SEARCH_GROUPS,
} from "../actions/group";
import { RECEIVE_GROUP_ROLE } from "../actions/authorization";
import { DataAction } from "../types/action";
import { GroupState } from "../types/data";
import { GroupOut, RoleType } from "../openapi/v2";
import { LIST_USERS, PREFIX_SEARCH_USERS } from "../actions/user";

const defaultState: GroupState = {
	groups: [],
	about: <GroupOut>{},
	role: <RoleType>{},
	users: [],
};

const group = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case CREATE_GROUP:
			return Object.assign({}, state, {
				groups: [...[], action.about, ...state.groups],
			});
		case RECEIVE_GROUPS:
			return Object.assign({}, state, { groups: action.groups });
		case SEARCH_GROUPS:
			return Object.assign({}, state, { groups: action.groups });
		case RECEIVE_GROUP_ABOUT:
			return Object.assign({}, state, { about: action.about });
		case RECEIVE_GROUP_ROLE:
			return Object.assign({}, state, { role: action.role });
		case DELETE_GROUP_MEMBER:
			return Object.assign({}, state, { about: action.about });
		case ADD_GROUP_MEMBER:
			return Object.assign({}, state, { about: action.about });
		case LIST_USERS:
			return Object.assign({}, state, { users: action.users });
		case PREFIX_SEARCH_USERS:
			return Object.assign({}, state, { users: action.users });
		case ASSIGN_GROUP_MEMBER_ROLE:
			return Object.assign({}, state, { about: action.about });
		case DELETE_GROUP:
			return Object.assign({}, state, {
				groups: state.groups.filter((group) => group.id !== action.about.id),
			});
		default:
			return state;
	}
};

export default group;
