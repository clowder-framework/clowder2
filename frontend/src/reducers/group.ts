import {
	RECEIVE_GROUPS,
	RECEIVE_GROUP_ABOUT, DELETE_GROUP_MEMBER, ADD_GROUP_MEMBER,
} from "../actions/group";
import {
	RECEIVE_GROUP_ROLE
} from "../actions/authorization";
import {DataAction} from "../types/action";
import {GroupState} from "../types/data";
import {GroupOut, RoleType} from "../openapi/v2";
import {LIST_USERS} from "../actions/user";

const defaultState: GroupState = {
	groups: [],
	about: <GroupOut>{},
	members: [],
	role: <RoleType>{},
	users: []
};

const group = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_GROUPS:
			return Object.assign({}, state, {groups: action.groups});
		case RECEIVE_GROUP_ABOUT:
			return Object.assign({}, state, {about: action.about, members: action.about.users});
		case RECEIVE_GROUP_ROLE:
			return Object.assign({}, state, {role: action.role});
		case DELETE_GROUP_MEMBER:
			return Object.assign({}, state, {
				members: state.members.filter(member => member.user.id !== action.member.id),
			});
		case ADD_GROUP_MEMBER:
			return Object.assign({}, state, {members: [...state.members, action.member]});
		case LIST_USERS:
			return Object.assign({}, state, {users: action.users});
        default:
            return state;
	}
};

export default group;
