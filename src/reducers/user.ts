import {SET_USER, LOGIN_ERROR, REGISTER_ERROR, REGISTER_USER} from "../actions/user";
import {UserState} from "../types/data";
import {DataAction} from "../types/action";

const defaultState: UserState = {
	Authorization: null,
	loginError: false,
	registerSucceeded: false,
	errorMsg: "",
};

const user = (state = defaultState, action: DataAction) => {
	switch(action.type) {
	case SET_USER:
		return Object.assign({}, state, {Authorization: action.Authorization, loginError: false});
	case LOGIN_ERROR:
		return Object.assign({}, state, {Authorization: null, loginError: true, errorMsg: action.errorMsg});
	case REGISTER_USER:
		return Object.assign({}, state, {registerSucceeded: true});
	case REGISTER_ERROR:
		return Object.assign({}, state, {registerSucceeded: false, errorMsg: action.errorMsg});
	default:
		return state;
	}
};

export default user;
