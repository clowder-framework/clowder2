import {FeedState} from "../types/data";
import {FeedListener, FeedOut, Paged, PageMetadata} from "../openapi/v2";
import {DataAction} from "../types/action";
import {RECEIVE_FEEDS} from "../actions/listeners";

const defaultState: FeedState = {
	feeds: <Paged>{ metadata: <PageMetadata>{}, data: <Array<FeedOut>>[] }
}

const feeds = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_FEEDS:
			return Object.assign({}, state, {feeds: action.feeds});
		default:
			return state;
	}
}

export default feeds;
