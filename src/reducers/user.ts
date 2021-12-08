import {SET_USER, LOGIN_ERROR, LOGOUT, REGISTER_ERROR, REGISTER_USER} from "../actions/user";
import {UserState} from "../types/data";
import {DataAction} from "../types/action";

const defaultState: UserState = {
	Authorization: null,
	loginError: false,
	registerError: false,
};

const user = (state = defaultState, action: DataAction) => {
	switch(action.type) {
	case SET_USER:
		return Object.assign({}, state, {Authorization: action.Authorization, loginError: false});
	case LOGIN_ERROR:
		return Object.assign({}, state, {Authorization: null, loginError: true});
	case REGISTER_USER:
		return Object.assign({}, state, {registerError: false});
	case REGISTER_ERROR:
		return Object.assign({}, state, {registerError: true});
	case LOGOUT:
		return Object.assign({}, state, {Authorization: null, loginError: false});
	default:
		return state;
	}
};

export default user;
