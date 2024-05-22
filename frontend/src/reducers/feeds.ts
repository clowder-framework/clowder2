import { FeedState } from "../types/data";
import { FeedOut, Paged, PageMetadata } from "../openapi/v2";
import { DataAction } from "../types/action";
import {
	CREATE_FEED,
	EDIT_FEED,
	RECEIVE_FEEDS,
	DELETE_FEED,
} from "../actions/listeners";

const defaultState: FeedState = {
	feeds: <Paged>{ metadata: <PageMetadata>{}, data: <Array<FeedOut>>[] },
};

const feeds = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case CREATE_FEED:
			return Object.assign({}, state, {
				feeds: {
					...state.feeds,
					data: state.feeds.data?.push(action.feed),
				},
			});
		case EDIT_FEED:
			return Object.assign({}, state, {
				feeds: {
					...state.feeds,
					data: state.feeds.data.map((feed: FeedOut) => {
						if (feed.id === action.feed.id) {
							return action.feed;
						}
						return feed;
					}),
				},
			});
		case RECEIVE_FEEDS:
			return Object.assign({}, state, { feeds: action.feeds });
		case DELETE_FEED:
			return Object.assign({}, state, {
				feeds: {
					...state.feeds,
					data: state.feeds.data.filter(
						(feed: FeedOut) => feed.id !== action.feed.id
					),
				},
			});

		default:
			return state;
	}
};

export default feeds;
