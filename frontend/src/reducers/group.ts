import {
	ADD_GROUP_MEMBER,
	ASSIGN_GROUP_MEMBER_ROLE,
	CREATE_GROUP,
	DELETE_GROUP,
	DELETE_GROUP_MEMBER,
	RECEIVE_GROUP_ABOUT,
	RECEIVE_GROUPS,
	RESET_CREATE_GROUP,
	SEARCH_GROUPS,
	UPDATE_GROUP,
} from "../actions/group";
import { RECEIVE_GROUP_ROLE } from "../actions/authorization";
import { DataAction } from "../types/action";
import { GroupState } from "../types/data";
import {
	GroupOut,
	Paged,
	PageMetadata,
	RoleType,
	UserOut,
} from "../openapi/v2";
import {
	ENABLE_READONLY,
	DISABLE_READONLY,
	LIST_USERS,
	PREFIX_SEARCH_USERS,
	REVOKE_ADMIN,
	SET_ADMIN,
} from "../actions/user";

const defaultState: GroupState = {
	groups: <Paged>{ metadata: <PageMetadata>{}, data: <GroupOut[]>[] },
	newGroup: <GroupOut>{},
	deletedGroup: <GroupOut>{},
	about: <GroupOut>{},
	role: <RoleType>{},
	users: <Paged>{ metadata: <PageMetadata>{}, data: <UserOut[]>[] },
};

const group = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case CREATE_GROUP:
			return Object.assign({}, state, { newGroup: action.about });
		case RESET_CREATE_GROUP:
			return Object.assign({}, state, { newGroup: {} });
		case RECEIVE_GROUPS:
			return Object.assign({}, state, { groups: action.groups });
		case SEARCH_GROUPS:
			return Object.assign({}, state, { groups: action.groups });
		case RECEIVE_GROUP_ABOUT:
			return Object.assign({}, state, { about: action.about });
		case RECEIVE_GROUP_ROLE:
			return Object.assign({}, state, { role: action.role });
		case DELETE_GROUP_MEMBER:
			return Object.assign({}, state, { deletedGroupMember: action.about });
		case UPDATE_GROUP:
			return Object.assign({}, state, { about: action.about });
		case ADD_GROUP_MEMBER:
			return Object.assign({}, state, { about: action.about });
		case LIST_USERS:
			return Object.assign({}, state, { users: action.users });
		case SET_ADMIN:
			return Object.assign({}, state, {
				users: {
					...state.users,
					data: state.users.data.map((user: UserOut) =>
						user.email === action.profile.email ? action.profile : user
					),
				},
			});
		case REVOKE_ADMIN:
			return Object.assign({}, state, {
				users: {
					...state.users,
					data: state.users.data.map((user: UserOut) =>
						user.email === action.profile.email ? action.profile : user
					),
				},
			});
		case ENABLE_READONLY:
			return Object.assign({}, state, {
				users: {
					...state.users,
					data: state.users.data.map((user: UserOut) =>
						user.email === action.profile.email ? action.profile : user
					),
				},
			});
		case DISABLE_READONLY:
			return Object.assign({}, state, {
				users: {
					...state.users,
					data: state.users.data.map((user: UserOut) =>
						user.email === action.profile.email ? action.profile : user
					),
				},
			});
		case PREFIX_SEARCH_USERS:
			return Object.assign({}, state, { users: action.users });
		case ASSIGN_GROUP_MEMBER_ROLE:
			return Object.assign({}, state, { about: action.about });
		case DELETE_GROUP:
			return Object.assign({}, state, {
				deletedGroup: action.about,
			});
		default:
			return state;
	}
};

export default group;
